import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { AbstractControl, FormArray, FormControl, FormGroup, ValidatorFn, Validators } from '@angular/forms';
import { Form, Level, Round, Competition } from '@/app/models/competition.model';
import { CreateCompetitionData } from '@/app/services/competition.service';
import { NewParticipant, ExistingParticipant } from '@/app/models/student.model';
import { schoolYearValidator } from '../schoolYearValidator';
import { Role } from '@/app/models/current-user';

function futureDateValidator(): ValidatorFn {
  return (control: AbstractControl) => {
    const selected = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selected > today ? { futureDate: true } : null;
  };
}

const ALL_ROUNDS: { value: Round, text: string }[] = [
  { value: Round.School,       text: 'Iskolai' },
  { value: Round.Regional,     text: 'Körzeti' },
  { value: Round.State,        text: 'Vármegyei' },
  { value: Round.National,     text: 'Országos' },
  { value: Round.OktvRoundOne, text: 'OKTV I. forduló' },
  { value: Round.OktvRoundTwo, text: 'OKTV II. forduló' },
  { value: Round.OktvFinal,    text: 'OKTV döntő' }
];

const OKTV_ROUNDS = new Set([Round.OktvRoundOne, Round.OktvRoundTwo, Round.OktvFinal]);

const NON_OKTV_ROUNDS = new Set([Round.School, Round.State, Round.Regional, Round.National]);

const ROUNDS_BY_LEVEL: Partial<Record<Level, Round[]>> = {
  [Level.Local]:    [Round.School, Round.Regional],
  [Level.Regional]: [Round.School, Round.Regional],
  [Level.State]:    [Round.School, Round.Regional, Round.State],
  [Level.National]: [Round.School, Round.Regional, Round.State, Round.National],
};

export interface CompetitionForm extends FormGroup {
    controls: {
        name: FormControl<string>;
        location: FormControl<string>;
        subject: FormArray<FormControl<string>>;
        teacher: FormArray<FormControl<string>>;
        date: FormControl<string>;
        level: FormControl<Level | null>;
        round: FormControl<Round | null>;
        oktv: FormControl<boolean>;
        online: FormControl<boolean>;
        forms: FormArray<FormControl<Form | null>>;
        result: FormGroup<{
            position: FormControl<number | null>;
            specialPrize: FormControl<boolean>;
            compliment: FormControl<boolean>;
            nextRound: FormControl<boolean>;
        }>;
        other: FormControl<string>;
    };
}

@Injectable()
export class CompetitionFormService {
    public readonly competitionForm: CompetitionForm = new FormGroup({
        name: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
        location: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
        subject: new FormArray<FormControl<string>>([
            new FormControl<string>('', { nonNullable: true, validators: [Validators.required] })
        ], [Validators.required]),
        teacher: new FormArray<FormControl<string>>([]),
        date: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
        level: new FormControl<Level | null>(null, { nonNullable: false, validators: [Validators.required] }),
        round: new FormControl<Round | null>(null, { nonNullable: false, validators: [Validators.required] }),
        oktv: new FormControl<boolean>(false, { nonNullable: true }),
        online: new FormControl<boolean>(false, { nonNullable: true }),
        forms: new FormArray<FormControl<Form | null>>([
            new FormControl<Form | null>(null, { nonNullable: false, validators: [Validators.required] })
        ], [Validators.required]),
        result: new FormGroup({
            position: new FormControl<number | null>(null, { nonNullable: false }),
            specialPrize: new FormControl<boolean>(false, { nonNullable: true }),
            compliment: new FormControl<boolean>(false, { nonNullable: true }),
            nextRound: new FormControl<boolean>(false, { nonNullable: true })
        }),
        other: new FormControl<string>('', { nonNullable: true })
    }) as CompetitionForm;

    private readonly filteredRoundsSubject = new BehaviorSubject<{ value: Round, text: string }[]>([]);
    readonly filteredRounds$ = this.filteredRoundsSubject.asObservable();
    get filteredRounds(): { value: Round, text: string }[] { return this.filteredRoundsSubject.getValue(); }

    constructor() {
        this.level.valueChanges.subscribe(level => {
            this.updateFilteredRounds(level);
        });
        this.updateFilteredRounds(this.level.value);
    }

    // Getters
    get name() { return this.competitionForm.controls.name; }
    get location() { return this.competitionForm.controls.location; }
    get subject() { return this.competitionForm.controls.subject; }
    get teacher() { return this.competitionForm.controls.teacher; }
    get date() { return this.competitionForm.controls.date; }
    get level() { return this.competitionForm.controls.level; }
    get round() { return this.competitionForm.controls.round; }
    get oktv() { return this.competitionForm.controls.oktv; }
    get online() { return this.competitionForm.controls.online; }
    get forms() { return this.competitionForm.controls.forms; }
    get result() { return this.competitionForm.controls.result; }
    get position() { return this.result.controls.position; }
    get specialPrize() { return this.result.controls.specialPrize; }
    get compliment() { return this.result.controls.compliment; }
    get nextRound() { return this.result.controls.nextRound; }
    get other() { return this.competitionForm.controls.other; }

    addSubject(subject = ''): void {
        this.subject.push(new FormControl<string>(subject, { nonNullable: true, validators: [Validators.required] }));
    }

    removeSubject(i: number) {
        this.subject.removeAt(i);
    }

    addTeacher(teacher = ''): void {
        this.teacher.push(new FormControl<string>(teacher, { nonNullable: true }));
    }

    removeTeacher(i: number) {
        this.teacher.removeAt(i);
    }

    addForm(form: Form | null = null): void {
        this.forms.push(new FormControl<Form | null>(form, { nonNullable: false, validators: [Validators.required] }));
    }

    removeForm(i: number) {
        this.forms.removeAt(i);
    }

    toggleOnline(checked: boolean): void {
        this.online.setValue(checked);
        if (checked) {
            this.location.setValue('Online');
            this.location.disable();
        } else {
            this.location.reset();
            this.location.enable();
        }
    }

    toggleOktv(checked: boolean): void {
        this.oktv.setValue(checked);
        this.round.reset();

        if (checked) {
            this.level.setValue(Level.National);
            this.level.disable();
        } else {
            this.level.enable();
        }

        this.updateFilteredRounds(this.level.value);
    }

    updateFilteredRounds(level: Level | null): void {
        const allowed = this.allowedRoundsFor(level, this.oktv.value);
        this.filteredRoundsSubject.next(ALL_ROUNDS.filter(r => allowed.has(r.value)));
        if (this.round.value && !allowed.has(this.round.value)) {
            this.round.setValue(null);
        }
    }

    private allowedRoundsFor(level: Level | null, isOktv: boolean): Set<Round> {
        if (isOktv) return OKTV_ROUNDS;
        if (!level) return NON_OKTV_ROUNDS;
        return new Set(ROUNDS_BY_LEVEL[level] ?? []);
    }

    fillForm(competition: Competition) {
        this.name.setValue(competition.name);
        this.location.setValue(competition.location);
        this.date.setValue(competition.date);
        this.level.setValue(competition.level);
        this.round.setValue(competition.round);
        this.other.setValue(competition.other);

        const isOktv = competition.round != null && OKTV_ROUNDS.has(competition.round);
        this.oktv.setValue(isOktv);
        if (isOktv) {
            this.level.disable();
        } else {
            this.level.enable();
        }

        const isOnline = competition.location?.toLowerCase() === 'online';
        this.online.setValue(isOnline);
        if (isOnline) {
            this.location.disable();
        }

        this.position.setValue(competition.result.position);
        this.specialPrize.setValue(competition.result.specialPrize);
        this.compliment.setValue(competition.result.compliment);
        this.nextRound.setValue(competition.result.nextRound);

        this.subject.clear();
        competition.subject.forEach(s => this.addSubject(s));

        this.teacher.clear();
        competition.teacher.forEach(t => this.addTeacher(t));

        this.forms.clear();
        competition.forms.forEach(f => this.addForm(f));
    }

    updateDateValidator(userRole: Role): void {
        const dateControl = this.date;
        dateControl.clearValidators();

        if (userRole === Role.ADMIN) {
            dateControl.addValidators([
                Validators.required
            ]);
        } else {
            dateControl.addValidators([
                Validators.required,
                futureDateValidator(),
                schoolYearValidator()
            ]);
        }

        dateControl.updateValueAndValidity();
    }

    buildCompetitionData(participants: Array<ExistingParticipant | NewParticipant>): CreateCompetitionData {
        return {
            name: this.name.value,
            location: this.location.value,
            subject: this.subject.value as string[],
            teacher: this.teacher.value as string[],
            date: this.date.value,
            level: this.level.value as Level,
            round: this.round.value!,
            participants,
            forms: this.forms.value as (Form | null)[],
            result: {
                position: this.position.value,
                specialPrize: this.specialPrize.value,
                compliment: this.compliment.value,
                nextRound: this.nextRound.value
            },
            other: this.other.value
        };
    }

    toggleSelects(enable: boolean) {
        if (enable) {
            this.competitionForm.enable();
        } else {
            this.competitionForm.disable();
        }
    }
}

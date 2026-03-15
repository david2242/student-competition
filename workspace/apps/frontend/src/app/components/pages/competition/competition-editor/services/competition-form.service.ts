import { Injectable } from '@angular/core';
import { FormArray, FormControl, FormGroup, Validators } from '@angular/forms';
import { Form, Level, Round, Competition } from '@/app/models/competition.model';
import { schoolYearValidator } from '../schoolYearValidator';
import { Role } from '@/app/models/current-user';

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

    filteredRounds: { value: Round, text: string }[] = [];

    private allRounds = [
        { value: Round.School, text: 'Iskolai' },
        { value: Round.State, text: 'Megyei' },
        { value: Round.Regional, text: 'Körzeti' },
        { value: Round.National, text: 'Országos' },
        { value: Round.OktvRoundOne, text: 'OKTV I. forduló' },
        { value: Round.OktvRoundTwo, text: 'OKTV II. forduló' },
        { value: Round.OktvFinal, text: 'OKTV döntő' }
    ];

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

    toggleOktv(checked: boolean): void {
        this.oktv.setValue(checked);
        this.round.reset();
        this.updateFilteredRounds(this.level.value);

        if (checked && (!this.level.value || this.level.value === Level.Local)) {
            this.level.setValue(Level.State);
        }
    }

    updateFilteredRounds(level: Level | null): void {
        if (!level) {
            this.filteredRounds = [];
            return;
        }

        if (this.oktv.value) {
            this.filteredRounds = this.allRounds.filter(round =>
                round.value === Round.OktvRoundOne ||
                round.value === Round.OktvRoundTwo ||
                round.value === Round.OktvFinal
            );
        } else {
            switch (level) {
                case Level.Local:
                    this.filteredRounds = this.allRounds.filter(round =>
                        round.value === Round.School ||
                        round.value === Round.Regional
                    );
                    break;
                case Level.State:
                    this.filteredRounds = this.allRounds.filter(round =>
                        round.value === Round.School ||
                        round.value === Round.State ||
                        round.value === Round.Regional
                    );
                    break;
                case Level.National:
                    this.filteredRounds = this.allRounds.filter(round =>
                        round.value === Round.Regional ||
                        round.value === Round.National
                    );
                    break;
                case Level.International:
                    this.filteredRounds = this.allRounds.filter(round =>
                        round.value === Round.National ||
                        round.value === Round.OktvFinal
                    );
                    break;
                default:
                    this.filteredRounds = [];
            }
        }

        // Reset round if the current selection is not in the filtered list
        const currentRound = this.round.value;
        if (currentRound && !this.filteredRounds.some(r => r.value === currentRound)) {
            this.round.setValue(null);
        }
    }

    fillForm(competition: Competition) {
        this.name.setValue(competition.name);
        this.location.setValue(competition.location);
        this.date.setValue(competition.date);
        this.level.setValue(competition.level);
        this.round.setValue(competition.round);
        this.other.setValue(competition.other);

        const isOktv = competition.round === Round.OktvRoundOne ||
            competition.round === Round.OktvRoundTwo ||
            competition.round === Round.OktvFinal;
        this.oktv.setValue(isOktv);

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
                Validators.required,
                schoolYearValidator()
            ]);
        } else {
            dateControl.addValidators([
                Validators.required,
                (control) => {
                    const selectedDate = new Date(control.value);
                    const today = new Date();
                    today.setHours(0, 0, 0, 0);

                    if (selectedDate > today) {
                        return { futureDate: true };
                    }
                    return null;
                },
                schoolYearValidator()
            ]);
        }

        dateControl.updateValueAndValidity();
    }

    toggleSelects(enable: boolean) {
        if (enable) {
            this.competitionForm.enable();
        } else {
            this.competitionForm.disable();
        }
    }
}

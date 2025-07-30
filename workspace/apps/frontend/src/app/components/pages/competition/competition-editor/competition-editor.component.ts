import { ActivatedRoute, Router } from "@angular/router";
import { BehaviorSubject, Subscription } from "rxjs";
import { CommonModule } from '@angular/common';
import { Competition, Form, Level, Round, Result } from "@/app/models/competition.model";
import { CompetitionService, CreateCompetitionData } from "@/app/services/competition.service";
import { Component, OnInit, OnDestroy, inject } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  FormsModule,
  ReactiveFormsModule,
  Validators
} from '@angular/forms';
import { Student, StudentSearchResult } from "@/app/models/student.model";
import { NotificationService } from "@/app/services/notification.service";
import { subjects } from "./subjects";
import { teachers } from "./teachers";
import { Role } from "@/app/models/current-user";
import { AuthService } from "@/app/services/auth.service";
import { schoolYearValidator } from "@/app/components/pages/competition/competition-editor/schoolYearValidator";
import { ParticipantEditorComponent } from "./components/participant-editor/participant-editor.component";
import { CompetitionParticipant } from "./models/participant.model";
import { ParticipantService } from "./services/participant.service";
import { NgFor, NgIf, AsyncPipe } from '@angular/common';

interface CompetitionForm extends FormGroup {
  controls: {
    name: FormControl<string>;
    location: FormControl<string>;
    subject: FormArray<FormControl<string>>;
    teacher: FormArray<FormControl<string>>;
    date: FormControl<string>;
    level: FormControl<Level | null>;
    round: FormControl<Round | null>;
    forms: FormArray<FormControl<Form | null>>;
    result: FormGroup<{
      enablePosition: FormControl<boolean>;
      position: FormControl<number | null>;
      specialPrize: FormControl<boolean>;
      compliment: FormControl<boolean>;
      nextRound: FormControl<boolean>;
    }>;
    other: FormControl<string>;
  };
}

@Component({
  selector: 'app-competition-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    ParticipantEditorComponent,
    NgFor,
    NgIf,
    AsyncPipe
  ],
  templateUrl: './competition-editor.component.html',
  styleUrl: './competition-editor.component.css',
})
export class CompetitionEditorComponent implements OnInit, OnDestroy {

  private subscriptions = new Subscription();

  competitionService = inject(CompetitionService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  notification = inject(NotificationService);
  authService = inject(AuthService);
  userRole: Role = Role.VIEWER;
  competition?: Competition;
  positionEnablerSubsripction?: Subscription;
  id: number | null = null;
  $displayMode = new BehaviorSubject<'show' | 'edit'>('show');
  subjects = subjects;
  teachers = teachers;
  protected readonly Level = Level;
  protected readonly Form = Form;
  protected readonly Round = Round;

  // Available rounds based on competition level
  filteredRounds: { value: Round, text: string }[] = [];

  // All possible rounds with their display text
  private allRounds = [
    { value: Round.School, text: 'Iskolai' },
    { value: Round.State, text: 'Megyei' },
    { value: Round.Regional, text: 'Körzeti' },
    { value: Round.National, text: 'Országos' },
    { value: Round.OktvRoundOne, text: 'OKTV I. forduló' },
    { value: Round.OktvRoundTwo, text: 'OKTV II. forduló' },
    { value: Round.OktvFinal, text: 'OKTV döntő' }
  ];

  // Position toggle handler
  onPositionToggle(checked: boolean): void {
    if (checked) {
      this.position.enable();
    } else {
      this.position.disable();
      this.position.setValue(null);
    }
  }

  competitionForm: CompetitionForm = new FormGroup({
    name: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    location: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    subject: new FormArray<FormControl<string>>([
      new FormControl<string>('', { nonNullable: true, validators: [Validators.required] })
    ], [Validators.required]),
    teacher: new FormArray<FormControl<string>>([], [Validators.required]),
    date: new FormControl<string>('', { nonNullable: true, validators: [Validators.required] }),
    level: new FormControl<Level | null>(null, { nonNullable: false, validators: [Validators.required] }),
    round: new FormControl<Round | null>(null, { nonNullable: false, validators: [Validators.required] }),
    forms: new FormArray<FormControl<Form | null>>([
      new FormControl<Form | null>(null, { nonNullable: false, validators: [Validators.required] })
    ], [Validators.required]),
    result: new FormGroup({
      enablePosition: new FormControl<boolean>(false, { nonNullable: true }),
      position: new FormControl<number | null>({ value: null, disabled: true }, { nonNullable: false }),
      specialPrize: new FormControl<boolean>(false, { nonNullable: true }),
      compliment: new FormControl<boolean>(false, { nonNullable: true }),
      nextRound: new FormControl<boolean>(false, { nonNullable: true })
    }),
    other: new FormControl<string>('', { nonNullable: true })
  }) as CompetitionForm;

  oktv = false;
  isLoading = false;
  participants: CompetitionParticipant[] = [];
  private participantService = inject(ParticipantService);

  saveIdFromParam(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? +idParam : null;
  }

  private updateDateValidator(): void {
    const dateControl = this.competitionForm.get('date');
    if (!dateControl) return;

    // Clear existing validators
    dateControl.clearValidators();

    // Add validators based on user role
    if (this.userRole === Role.ADMIN) {
      // Admins can add past competitions
      dateControl.addValidators(Validators.required);
    } else {
      // Regular users can only add future or current date competitions
      dateControl.addValidators([
        Validators.required,
        (control) => {
          const selectedDate = new Date(control.value);
          const today = new Date();
          today.setHours(0, 0, 0, 0);

          if (selectedDate < today) {
            return { pastDate: true };
          }
          return null;
        }
      ]);
    }

    // Update validation status
    dateControl.updateValueAndValidity();
  }

  private positionEnabler(): void {
    if (!this.enablePosition.value) {
      this.position.disable();
    }

    this.subscriptions.add(
      this.enablePosition.valueChanges.subscribe(checked => {
        if (checked) {
          this.position.enable();
        } else {
          this.position.disable();
          this.position.setValue(null);
        }
      })
    );
  }

  ngOnInit(): void {
    // Set up round filtering based on level changes
    this.competitionForm.get('level')?.valueChanges.subscribe(level => {
      this.updateFilteredRounds(level);
    });

    // Initialize filtered rounds
    this.updateFilteredRounds(this.competitionForm.get('level')?.value);

    this.saveIdFromParam();
    if (this.id) {
      this.$displayMode.next('show');
      this.competitionService.getCompetition(this.id).subscribe({
        next: (competition) => {
          this.competition = competition;
          this.fillForm(competition);
          // Initialize participants from competition data
          if (competition.participants) {
            const participants = competition.participants.map(p => ({
              studentId: p.studentId,  // This one can be undefined for new participants
              firstName: p.firstName || '',
              lastName: p.lastName || '',
              classYear: p.classYear || 9,  // Default to 9th grade if not provided
              classLetter: p.classLetter || 'a'  // Default to 'a' class if not provided
            }));
            this.participantService.initialize(participants);
          }
        },
        error: () => this.notification.error('Nem sikerült betölteni a versenyt!'),
      });
    } else {
      this.$displayMode.next('edit');
    }

    // Subscribe to participant changes
    this.participantService.participants$.subscribe(participants => this.onParticipantsChange(participants));

    this.positionEnabler();
    this.$displayMode.subscribe((mode) => {
      if (mode === 'show') {
        this.toggleSelects(false);
      } else {
        this.toggleSelects(true);
      }
    });

    this.authService.$currentUser.subscribe(user => {
      this.userRole = user?.role || Role.VIEWER;
      this.updateDateValidator();
    });
  }

  private fillForm(competition: Competition) {
    // Set basic form values
    this.name.setValue(competition.name);
    this.location.setValue(competition.location);
    this.date.setValue(competition.date);
    this.level.setValue(competition.level);
    this.round.setValue(competition.round);
    this.other.setValue(competition.other);

    // Set result values
    this.position.setValue(competition.result.position);
    this.specialPrize.setValue(competition.result.specialPrize);
    this.compliment.setValue(competition.result.compliment);
    this.nextRound.setValue(competition.result.nextRound);
    this.enablePosition.setValue(!!competition.result.position);

    // Set up form arrays
    this.subject.clear();
    competition.subject.forEach(subject => {
      this.addSubject(subject);
    });

    this.teacher.clear();
    competition.teacher.forEach(teacher => {
      this.addTeacher(teacher);
    });

    this.forms.clear();
    competition.forms.forEach(form => {
      this.addForm(form);
    });
  }

  ngOnDestroy(): void {
    this.positionEnablerSubsripction?.unsubscribe();
    this.subscriptions.unsubscribe();
  }



  // Form controls with proper typing
  get name() { return this.competitionForm.controls.name; }
  get location() { return this.competitionForm.controls.location; }
  get subject() { return this.competitionForm.controls.subject; }
  get teacher() { return this.competitionForm.controls.teacher; }
  get date() { return this.competitionForm.controls.date; }
  get level() { return this.competitionForm.controls.level; }
  get round() { return this.competitionForm.controls.round; }
  get forms() { return this.competitionForm.controls.forms; }
  get result() { return this.competitionForm.controls.result; }
  get enablePosition() { return this.result.controls.enablePosition; }
  get position() { return this.result.controls.position; }
  get specialPrize() { return this.result.controls.specialPrize; }
  get compliment() { return this.result.controls.compliment; }
  get nextRound() { return this.result.controls.nextRound; }
  get other() { return this.competitionForm.controls.other; }

  addSubject(subject: string = ''): void {
    this.subject.push(new FormControl<string>(subject, { nonNullable: true, validators: [Validators.required] }));
  }

  addTeacher(teacher: string = ''): void {
    this.teacher.push(new FormControl<string>(teacher, { nonNullable: true }));
  }

  addForm(form: Form | null = null): void {
    this.forms.push(new FormControl<Form | null>(form, { nonNullable: false, validators: [Validators.required] }));
  }

  onSubmit(): void {
    if (this.competitionForm.invalid) {
      this.competitionForm.markAllAsTouched();
      this.notification.error('Kérem töltse ki az összes kötelező mezőt!');
      return;
    }

    this.isLoading = true;
    // Get participants from the participant service
    const participants = this.participantService.getParticipantsForSubmission();

    // Check if there are any participants
    if (!participants || participants.length === 0) {
      this.notification.error('Legalább egy résztvevőt hozzá kell adni!');
      this.isLoading = false;
      return;
    }

    // Get form values using the typed getters
    const competitionData: CreateCompetitionData = {
      name: this.name.value,
      location: this.location.value,
      subject: this.subject.value as string[],
      teacher: this.teacher.value as string[],
      date: this.date.value,
      level: this.level.value as Level,
      round: this.round.value as Round,
      participants: participants,
      forms: this.forms.value as Form[],
      result: {
        position: this.position.value,
        specialPrize: this.specialPrize.value,
        compliment: this.compliment.value,
        nextRound: this.nextRound.value
      },
      other: this.other.value
    };

    const request$ = this.id
      ? this.competitionService.updateCompetition(this.id, competitionData)
      : this.competitionService.createCompetition(competitionData);

    request$.subscribe({
      next: () => {
        this.notification.success(
          this.id
            ? 'A verseny sikeresen frissítve!'
            : 'A verseny sikeresen létrehozva!'
        );
        this.router.navigate(['/competitions']);
      },
      error: (error) => {
        console.error('Error:', error);
        this.notification.error('Hiba történt a mentés során.');
        this.isLoading = false;
      }
    });
  }

  removeSubject(i: number) {
    this.subject.removeAt(i);
  }

  removeTeacher(i: number) {
    this.teacher.removeAt(i);
  }

  removeForm(i: number) {
    this.forms.removeAt(i);
  }

  back() {
    this.router.navigate([ 'competition' ]);
  }

  editMode() {
    this.$displayMode.next('edit');
  }

  private toggleSelects(enable: boolean) {
    if (enable) {
      // Enable all form controls
      this.name.enable();
      this.location.enable();
      this.subject.enable();
      this.subject.controls.forEach(c => c.enable());
      this.teacher.enable();
      this.teacher.controls.forEach(c => c.enable());
      this.date.enable();
      this.level.enable();
      this.round.enable();
      this.forms.enable();
      this.forms.controls.forEach(c => c.enable());
      this.result.enable();
      this.enablePosition.enable();
      this.position.enable();
      this.specialPrize.enable();
      this.compliment.enable();
      this.nextRound.enable();
      this.other.enable();

      // Re-apply the position enabler state
      if (!this.enablePosition.value) {
        this.position.disable();
      }
    } else {
      // Disable all form controls
      this.name.disable();
      this.location.disable();
      this.subject.disable();
      this.subject.controls.forEach(c => c.disable());
      this.teacher.disable();
      this.teacher.controls.forEach(c => c.disable());
      this.date.disable();
      this.level.disable();
      this.round.disable();
      this.forms.disable();
      this.forms.controls.forEach(c => c.disable());
      this.result.disable();
      this.enablePosition.disable();
      this.position.disable();
      this.specialPrize.disable();
      this.compliment.disable();
      this.nextRound.disable();
      this.other.disable();
    }
  }

  showMode() {
    if (this.competition) {
      this.fillForm(this.competition);
    }
    this.$displayMode.next('show');
  }

  deleteCompetition() {
    if (this.id == null) {
      return;
    }

    if (window.confirm('Are you sure you want to delete this competition?')) {
      this.competitionService
        .deleteCompetition(this.id)
        .subscribe(() => {
          this.notification.success('Competition deleted successfully');
          this.router.navigate(['/competitions']);
        });
    }
  }

  private updateFilteredRounds(level: Level | null): void {
    if (!level) {
      this.filteredRounds = [];
      return;
    }

    if (this.oktv) {
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

  /**
   * Handles changes to the participants list from the participant editor
   * @param participants The updated list of participants
   */
  onParticipantsChange(participants: CompetitionParticipant[]): void {
    // This method is called when participants change in the child component
    // The participants are already updated in the service, so we just need to update the local state
    this.participants = [...participants];
    this.competitionForm.markAsTouched();
  }

  /**
   * Toggles the OKTV mode on/off
   * @param checked Whether OKTV mode is enabled
   */
  toggleOktv(checked: boolean): void {
    this.oktv = checked;

    // Reset the round when toggling OKTV mode
    this.round.reset();

    // Update filtered rounds based on the current level
    this.updateFilteredRounds(this.level.value);

    // If switching to OKTV mode, ensure the level is set to a valid value
    if (checked && (!this.level.value || this.level.value === Level.Local)) {
      this.level.setValue(Level.State);
    }
  }

  protected readonly Role = Role;
}

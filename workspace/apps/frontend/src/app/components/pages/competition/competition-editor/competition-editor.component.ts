import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, map, combineLatest } from 'rxjs';
import { CommonModule } from '@angular/common';
import { Competition, Level } from '@/app/models/competition.model';
import { CompetitionService, CreateCompetitionData } from '@/app/services/competition.service';
import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ReactiveFormsModule } from '@angular/forms';
import { NotificationService } from '@/app/services/notification.service';
import { subjects } from './subjects';
import { teachers } from './teachers';
import { Role } from '@/app/models/current-user';
import { AuthService } from '@/app/services/auth.service';
import { ParticipantEditorComponent } from './components/participant-editor/participant-editor.component';
import { CompetitionHeaderComponent } from './components/competition-header/competition-header.component';
import { ParticipantService } from './services/participant.service';
import { AsyncPipe } from '@angular/common';
import { CompetitionFieldComponent } from './components/competition-field/competition-field.component';
import { CompetitionListFieldComponent } from './components/competition-list-field/competition-list-field.component';
import { CompetitionSelectFieldComponent } from './components/competition-select-field/competition-select-field.component';
import { CompetitionCheckboxFieldComponent } from './components/competition-checkbox-field/competition-checkbox-field.component';
import { CompetitionDateFieldComponent } from './components/competition-date-field/competition-date-field.component';
import { CompetitionResultComponent } from './components/competition-result/competition-result.component';
import { CompetitionFormService } from './services/competition-form.service';

@Component({
  selector: 'app-competition-editor',
  standalone: true,
  providers: [CompetitionFormService, ParticipantService],
  imports: [
    CommonModule,
    ReactiveFormsModule,
    ParticipantEditorComponent,
    CompetitionHeaderComponent,
    AsyncPipe,
    CompetitionFieldComponent,
    CompetitionListFieldComponent,
    CompetitionSelectFieldComponent,
    CompetitionCheckboxFieldComponent,
    CompetitionDateFieldComponent,
    CompetitionResultComponent
  ],
  templateUrl: './competition-editor.component.html',
  styleUrl: './competition-editor.component.css',
})
export class CompetitionEditorComponent implements OnInit {

  private destroyRef = inject(DestroyRef);
  private competition$ = new BehaviorSubject<Competition | null>(null);

  private competitionService = inject(CompetitionService);
  formService = inject(CompetitionFormService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notification = inject(NotificationService);
  private authService = inject(AuthService);
  private participantService = inject(ParticipantService);

  userRole: Role = Role.VIEWER;
  competition?: Competition;
  id: number | null = null;
  $displayMode = new BehaviorSubject<'show' | 'edit'>('show');
  subjects = subjects;
  teachers = teachers;
  isLoading = false;
  protected readonly Level = Level;
  protected readonly Role = Role;

  readonly levelOptions = [
    { value: Level.Local, text: 'Helyi' },
    { value: Level.State, text: 'Vármegyei' },
    { value: Level.National, text: 'Országos' },
  ];

  readonly formOptions = [
    { value: 'written', text: 'Írásbeli' },
    { value: 'oral', text: 'Szóbeli' },
    { value: 'sport', text: 'Sport' },
    { value: 'submission', text: 'Pályázatos' },
  ];

  isCompetitionDeletable$ = combineLatest([
    this.authService.$currentUser,
    this.competition$
  ]).pipe(
    map(([user, competition]) => {
      if (!user || !competition) return false;
      return user.role === Role.ADMIN ||
        (user.role === Role.CONTRIBUTOR && competition.creatorId === user.id);
    })
  );

  saveIdFromParam(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? +idParam : null;
  }

  ngOnInit(): void {
    this.saveIdFromParam();
    if (this.id) {
      this.$displayMode.next('show');
      this.competitionService.getCompetition(this.id).subscribe({
        next: (competition) => {
          this.competition = competition;
          this.competition$.next(competition);
          this.formService.fillForm(competition);
          if (competition.participants) {
            const participants = competition.participants.map(p => ({
              studentId: p.studentId,
              firstName: p.firstName || '',
              lastName: p.lastName || '',
              classYear: p.classYear || 9,
              classLetter: p.classLetter || 'a'
            }));
            this.participantService.initialize(participants);
          }
          this.formService.toggleSelects(false);
        },
        error: () => {
          this.notification.error('Nem sikerült betölteni a versenyt!');
          this.competition$.next(null);
          this.router.navigate(['/competitions']);
        }
      });
    } else {
      this.$displayMode.next('edit');
      this.competition$.next(null);
    }

    this.$displayMode
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((mode) => {
        if (mode === 'show') {
          this.formService.toggleSelects(false);
        } else {
          this.formService.toggleSelects(true);
        }
      });

    this.authService.$currentUser
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(user => {
        this.userRole = user?.role || Role.VIEWER;
        this.formService.updateDateValidator(this.userRole);
      });
  }

  onSubmit(): void {
    if (this.formService.competitionForm.invalid) {
      this.formService.competitionForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const participants = this.participantService.getParticipantsForSubmission();

    if (!participants || participants.length === 0) {
      this.notification.error('Legalább egy résztvevőt hozzá kell adni!');
      this.isLoading = false;
      return;
    }

    const competitionData: CreateCompetitionData = {
      name: this.formService.name.value,
      location: this.formService.location.value,
      subject: this.formService.subject.value as string[],
      teacher: this.formService.teacher.value as string[],
      date: this.formService.date.value,
      level: this.formService.level.value as Level,
      round: this.formService.round.value!,
      participants: participants,
      forms: this.formService.forms.value as any[],
      result: {
        position: this.formService.position.value,
        specialPrize: this.formService.specialPrize.value,
        compliment: this.formService.compliment.value,
        nextRound: this.formService.nextRound.value
      },
      other: this.formService.other.value
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
        this.participantService.clearParticipants();
        this.router.navigate(['/competitions']);
      },
      error: (error) => {
        console.error('Error:', error);
        this.notification.error('Hiba történt a mentés során.');
        this.isLoading = false;
      }
    });
  }

  back() {
    this.router.navigate(['competition']);
  }

  editMode() {
    this.$displayMode.next('edit');
  }

  showMode() {
    if (this.competition) {
      this.formService.fillForm(this.competition);
    }
    this.$displayMode.next('show');
  }

  deleteCompetition() {
    if (this.id == null) {
      return;
    }

    if (window.confirm('Biztosan törölni szeretné ezt a versenyt?')) {
      this.competitionService
        .deleteCompetition(this.id)
        .subscribe({
          next: () => {
            this.notification.success('A verseny sikeresen törölve!');
            this.router.navigate(['/competitions']);
          },
          error: () => {
            this.notification.error('Hiba történt a törlés során.');
          }
        });
    }
  }
}

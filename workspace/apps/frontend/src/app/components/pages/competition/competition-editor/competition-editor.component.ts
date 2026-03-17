import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { AsyncPipe, CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

import { BehaviorSubject, combineLatest, map } from 'rxjs';

import { Competition, Level } from '@/app/models/competition.model';
import { Student } from '@/app/models/student.model';
import { CompetitionParticipant } from './models/participant.model';
import { CompetitionService } from '@/app/services/competition.service';
import { NotificationService } from '@/app/services/notification.service';
import { AuthService } from '@/app/services/auth.service';
import { Role } from '@/app/models/current-user';
import { subjects } from './subjects';
import { teachers } from './teachers';
import { CompetitionFormService } from './services/competition-form.service';
import { ParticipantService } from './services/participant.service';
import { ParticipantEditorComponent } from './components/participant-editor/participant-editor.component';
import { CompetitionHeaderComponent } from './components/competition-header/competition-header.component';
import { CompetitionFieldComponent } from './components/competition-field/competition-field.component';
import { CompetitionListFieldComponent } from './components/competition-list-field/competition-list-field.component';
import { CompetitionSelectFieldComponent } from './components/competition-select-field/competition-select-field.component';
import { CompetitionCheckboxFieldComponent } from './components/competition-checkbox-field/competition-checkbox-field.component';
import { CompetitionDateFieldComponent } from './components/competition-date-field/competition-date-field.component';
import { CompetitionResultComponent } from './components/competition-result/competition-result.component';

@Component({
  selector: 'app-competition-editor',
  standalone: true,
  providers: [CompetitionFormService, ParticipantService],
  imports: [
    CommonModule,
    AsyncPipe,
    ReactiveFormsModule,
    ParticipantEditorComponent,
    CompetitionHeaderComponent,
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
  private competitionService = inject(CompetitionService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private notification = inject(NotificationService);
  private authService = inject(AuthService);
  private participantService = inject(ParticipantService);
  formService = inject(CompetitionFormService);

  id: number | null = null;
  $displayMode = new BehaviorSubject<'show' | 'edit'>('show');
  private competition$ = new BehaviorSubject<Competition | null>(null);
  userRole: Role = Role.VIEWER;
  isLoading = false;
  protected readonly Level = Level;
  protected readonly Role = Role;

  subjects = subjects;
  teachers = teachers;

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

  isCompetitionModifiable$ = combineLatest([
    this.authService.$currentUser,
    this.competition$
  ]).pipe(
    map(([user, competition]) => {
      if (!user || !competition) return false;
      return user.role === Role.ADMIN ||
        (user.role === Role.CONTRIBUTOR && competition.creatorId === user.id);
    })
  );

  ngOnInit(): void {
    this.id = this.resolveIdFromRoute();
    this.loadCompetition();
    this.subscribeToDisplayMode();
    this.subscribeToCurrentUser();
  }

  private resolveIdFromRoute(): number | null {
    const idParam = this.route.snapshot.paramMap.get('id');
    return idParam ? +idParam : null;
  }

  private loadCompetition(): void {
    if (!this.id) {
      this.initializeNewCompetition();
      return;
    }

    this.$displayMode.next('show');
    this.competitionService.getCompetition(this.id).subscribe({
      next: (competition) => this.onCompetitionLoaded(competition),
      error: () => this.onCompetitionLoadError()
    });
  }

  private initializeNewCompetition(): void {
    this.$displayMode.next('edit');
    this.competition$.next(null);
  }

  private onCompetitionLoaded(competition: Competition): void {
    this.competition$.next(competition);
    this.formService.fillForm(competition);
    this.participantService.initialize(this.normalizeParticipants(competition.participants));
    this.formService.toggleSelects(false);
  }

  private normalizeParticipants(participants: Student[]): CompetitionParticipant[] {
    return participants.map(p => ({
      studentId: p.studentId,
      firstName: p.firstName ?? '',
      lastName: p.lastName ?? '',
      classYear: p.classYear ?? 9,
      classLetter: p.classLetter ?? 'a'
    }));
  }

  private onCompetitionLoadError(): void {
    this.notification.error('Nem sikerült betölteni a versenyt!');
    this.competition$.next(null);
    this.router.navigate(['/competitions']);
  }

  private subscribeToDisplayMode(): void {
    this.$displayMode
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((mode) => {
        if (mode === 'show') {
          this.formService.toggleSelects(false);
        } else {
          this.formService.toggleSelects(true);
        }
      });
  }

  private subscribeToCurrentUser(): void {
    this.authService.$currentUser
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(user => {
        this.userRole = user?.role || Role.VIEWER;
        this.formService.updateDateValidator(this.userRole);
      });
  }

  onSubmit(): void {
    if (!this.isFormReadyToSubmit()) return;

    this.isLoading = true;
    const participants = this.participantService.getParticipantsForSubmission();

    if (!this.hasParticipants(participants)) return;

    const competitionData = this.formService.buildCompetitionData(participants);
    this.saveCompetition(competitionData);
  }

  private isFormReadyToSubmit(): boolean {
    if (this.formService.competitionForm.invalid) {
      this.formService.competitionForm.markAllAsTouched();
      return false;
    }
    return true;
  }

  private hasParticipants(participants: ReturnType<ParticipantService['getParticipantsForSubmission']>): boolean {
    if (participants.length === 0) {
      this.notification.error('Legalább egy résztvevőt hozzá kell adni!');
      this.isLoading = false;
      return false;
    }
    return true;
  }

  private saveCompetition(competitionData: ReturnType<CompetitionFormService['buildCompetitionData']>): void {
    const request$ = this.id
      ? this.competitionService.updateCompetition(this.id, competitionData)
      : this.competitionService.createCompetition(competitionData);

    request$.subscribe({
      next: () => this.onSaveSuccess(),
      error: (error) => this.onSaveError(error)
    });
  }

  private onSaveSuccess(): void {
    this.notification.success(this.id ? 'A verseny sikeresen frissítve!' : 'A verseny sikeresen létrehozva!');
    this.participantService.clearParticipants();
    this.router.navigate(['/competitions']);
  }

  private onSaveError(error: unknown): void {
    console.error('Error:', error);
    this.notification.error('Hiba történt a mentés során.');
    this.isLoading = false;
  }

  editMode() {
    this.$displayMode.next('edit');
  }

  showMode() {
    const competition = this.competition$.getValue();
    if (competition) this.formService.fillForm(competition);
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

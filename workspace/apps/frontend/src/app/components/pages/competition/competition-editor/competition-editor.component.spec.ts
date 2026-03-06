import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, BehaviorSubject, throwError, map, take } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { CompetitionEditorComponent } from './competition-editor.component';
import { CompetitionService } from "@/app/services/competition.service";
import { NotificationService } from "@/app/services/notification.service";
import { AuthService } from "@/app/services/auth.service";
import { ParticipantService } from "./services/participant.service";
import { Role } from "@/app/models/current-user";
import { Level, Round, Form } from "@/app/models/competition.model";
import { NoopAnimationsModule } from '@angular/platform-browser/animations';

describe('CompetitionEditorComponent', () => {
  let component: CompetitionEditorComponent;
  let fixture: ComponentFixture<CompetitionEditorComponent>;
  let competitionService: any;
  let notificationService: any;
  let authService: any;
  let participantService: any;
  let router: any;

  const currentUserSubject = new BehaviorSubject<any>({ role: Role.ADMIN, id: 1 });
  const participantsSubject = new BehaviorSubject<any[]>([]);

  beforeEach(async () => {
    competitionService = {
      getCompetition: jest.fn().mockReturnValue(of({
        id: 1,
        name: 'Test Competition',
        location: 'Test Location',
        date: '2026.01.01',
        level: Level.State,
        round: Round.State,
        subject: ['Math'],
        teacher: ['Teacher 1'],
        forms: [Form.Written],
        result: { position: 1, specialPrize: false, compliment: false, nextRound: false },
        participants: [],
        other: ''
      })),
      createCompetition: jest.fn().mockReturnValue(of({})),
      updateCompetition: jest.fn().mockReturnValue(of({})),
      deleteCompetition: jest.fn().mockReturnValue(of({}))
    };

    notificationService = {
      success: jest.fn(),
      error: jest.fn()
    };

    authService = {
      $currentUser: currentUserSubject.asObservable(),
    };

    participantService = {
      participants$: participantsSubject.asObservable(),
      initialize: jest.fn(),
      clearParticipants: jest.fn(),
      getParticipantsForSubmission: jest.fn().mockReturnValue([{ studentId: 101, classYear: 9, classLetter: 'A' }])
    };

    router = {
      navigate: jest.fn()
    };

    await TestBed.configureTestingModule({
      imports: [CompetitionEditorComponent, NoopAnimationsModule],
      providers: [
        { provide: CompetitionService, useValue: competitionService },
        { provide: NotificationService, useValue: notificationService },
        { provide: AuthService, useValue: authService },
        { provide: ParticipantService, useValue: participantService },
        { provide: Router, useValue: router },
        {
          provide: ActivatedRoute,
          useValue: {
            snapshot: {
              paramMap: {
                get: jest.fn().mockReturnValue(null)
              }
            }
          }
        }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CompetitionEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  describe('Form Validation', () => {
    it('should be invalid when empty', () => {
      expect(component.competitionForm.valid).toBeFalsy();
    });

    it('should require name, location, subject, date, level, and round', () => {
      const controls = component.competitionForm.controls;
      expect(controls.name.errors?.['required']).toBeTruthy();
      expect(controls.location.errors?.['required']).toBeTruthy();
      expect(controls.date.errors?.['required']).toBeTruthy();
      expect(controls.level.errors?.['required']).toBeTruthy();
      expect(controls.round.errors?.['required']).toBeTruthy();
    });

    it('should validate date format (schoolYearValidator)', () => {
      const dateControl = component.competitionForm.controls.date;
      dateControl.setValue('2020.01.01');
      expect(dateControl.errors?.['schoolYear']).toBeTruthy();
    });
  });

  describe('OKTV Logic', () => {
    it('should update filtered rounds when OKTV is toggled ON', () => {
      component.toggleOktv(true);
      expect(component.filteredRounds.some(r => r.value === Round.OktvRoundOne)).toBeTruthy();
      expect(component.filteredRounds.some(r => r.value === Round.School)).toBeFalsy();
    });

    it('should update filtered rounds when level changes', () => {
      component.level.setValue(Level.Local);
      fixture.detectChanges();
      expect(component.filteredRounds.some(r => r.value === Round.School)).toBeTruthy();
      expect(component.filteredRounds.some(r => r.value === Round.National)).toBeFalsy();
    });
  });

  describe('Display Modes', () => {
    it('should disable controls in show mode', () => {
      component.$displayMode.next('show');
      fixture.detectChanges();
      expect(component.name.disabled).toBeTruthy();
      expect(component.location.disabled).toBeTruthy();
    });

    it('should enable controls in edit mode', () => {
      component.$displayMode.next('edit');
      fixture.detectChanges();
      expect(component.name.enabled).toBeTruthy();
    });
  });

  describe('Form Array Manipulation', () => {
    it('should add and remove subjects', () => {
      const initialCount = component.subject.length;
      component.addSubject('New Subject');
      expect(component.subject.length).toBe(initialCount + 1);
      expect(component.subject.at(initialCount).value).toBe('New Subject');

      component.removeSubject(initialCount);
      expect(component.subject.length).toBe(initialCount);
    });

    it('should add and remove teachers', () => {
      component.addTeacher('New Teacher');
      expect(component.teacher.length).toBe(1);
      expect(component.teacher.at(0).value).toBe('New Teacher');

      component.removeTeacher(0);
      expect(component.teacher.length).toBe(0);
    });

    it('should add and remove forms', () => {
      const initialCount = component.forms.length;
      component.addForm(Form.Oral);
      expect(component.forms.length).toBe(initialCount + 1);
      expect(component.forms.at(initialCount).value).toBe(Form.Oral);

      component.removeForm(initialCount);
      expect(component.forms.length).toBe(initialCount);
    });
  });

  describe('Round Filtering Logic', () => {
    it('should filter rounds for Local level', () => {
      component.level.setValue(Level.Local);
      expect(component.filteredRounds.every(r =>
        r.value === Round.School || r.value === Round.Regional
      )).toBeTruthy();
    });

    it('should filter rounds for National level', () => {
      component.level.setValue(Level.National);
      expect(component.filteredRounds.every(r =>
        r.value === Round.Regional || r.value === Round.National
      )).toBeTruthy();
    });

    it('should reset round if not valid for new level', () => {
      component.level.setValue(Level.National);
      component.round.setValue(Round.National);

      component.level.setValue(Level.Local);
      expect(component.round.value).toBeNull();
    });

    it('should filter for OKTV rounds when OKTV is enabled', () => {
      component.toggleOktv(true);
      expect(component.filteredRounds.every(r =>
        [Round.OktvRoundOne, Round.OktvRoundTwo, Round.OktvFinal].includes(r.value)
      )).toBeTruthy();
    });
  });

  describe('Role-based Validation & UI', () => {
    it('should allow future dates for ADMIN', () => {
      currentUserSubject.next({ role: Role.ADMIN, id: 1 });
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const dateStr = `${futureDate.getFullYear()}.09.01`;

      component.date.setValue(dateStr);
      expect(component.date.errors?.['futureDate']).toBeFalsy();
    });

    it('should NOT allow future dates for CONTRIBUTOR', () => {
      currentUserSubject.next({ role: Role.CONTRIBUTOR, id: 2 });
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const dateStr = `${futureDate.getFullYear()}.09.01`;

      component.date.setValue(dateStr);
      expect(component.date.errors?.['futureDate']).toBeTruthy();
    });

    describe('Deletable logic', () => {
      beforeEach(() => {
        const competition = { creatorId: 10 };
        (component as any).competition$.next(competition);
      });

      it('should be deletable for ADMIN', (done) => {
        currentUserSubject.next({ role: Role.ADMIN, id: 1 });
        component.isCompetitionDeletable$.pipe(take(1)).subscribe(deletable => {
          expect(deletable).toBe(true);
          done();
        });
      });

      it('should be deletable for Creator CONTRIBUTOR', (done) => {
        currentUserSubject.next({ role: Role.CONTRIBUTOR, id: 10 });
        component.isCompetitionDeletable$.pipe(take(1)).subscribe(deletable => {
          expect(deletable).toBe(true);
          done();
        });
      });

      it('should NOT be deletable for other CONTRIBUTOR', (done) => {
        currentUserSubject.next({ role: Role.CONTRIBUTOR, id: 11 });
        component.isCompetitionDeletable$.pipe(take(1)).subscribe(deletable => {
          expect(deletable).toBe(false);
          done();
        });
      });
    });
  });

  describe('Submission', () => {
    beforeEach(() => {
      component.name.setValue('Test');
      component.location.setValue('Test');
      component.date.setValue('2026.01.01');
      component.level.setValue(Level.State);
      component.round.setValue(Round.State);
      component.subject.at(0).setValue('Math');
      component.forms.at(0).setValue(Form.Written);
    });

    it('should call createCompetition on submit when ID is null', fakeAsync(() => {
      component.onSubmit();
      tick();
      expect(competitionService.createCompetition).toHaveBeenCalled();
      expect(notificationService.success).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/competitions']);
    }));

    it('should show error notification on failed submission', fakeAsync(() => {
      competitionService.createCompetition.mockReturnValue(throwError(() => new Error('API Error')));
      component.onSubmit();
      tick();
      expect(notificationService.error).toHaveBeenCalled();
    }));

    it('should prevent submission if no participants', () => {
      participantService.getParticipantsForSubmission.mockReturnValue([]);
      component.onSubmit();
      expect(notificationService.error).toHaveBeenCalledWith('Legalább egy résztvevőt hozzá kell adni!');
      expect(competitionService.createCompetition).not.toHaveBeenCalled();
    });
  });
});

import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, BehaviorSubject, throwError } from "rxjs";
import { ActivatedRoute, Router } from "@angular/router";
import { Form, Level, Round } from "@/app/models/competition.model";
import { CompetitionService } from "@/app/services/competition.service";
import { CompetitionEditorComponent } from './competition-editor.component';
import { Role } from "@/app/models/current-user";
import { take } from "rxjs/operators";
import { NotificationService } from "@/app/services/notification.service";
import { AuthService } from "@/app/services/auth.service";
import { ParticipantService } from "./services/participant.service";
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CompetitionFormService } from "./services/competition-form.service";
import { getCurrentSchoolYear } from "./schoolYearValidator";

describe('CompetitionEditorComponent', () => {
  let component: CompetitionEditorComponent;
  let fixture: ComponentFixture<CompetitionEditorComponent>;
  let competitionService: any;
  let notificationService: any;
  let router: any;
  let participantService: any;
  let authService: any;
  let currentUserSubject: BehaviorSubject<any>;

  beforeEach(async () => {
    competitionService = {
      getCompetition: jest.fn().mockReturnValue(of({
        id: 1,
        name: 'Test Competition',
        location: 'Test Location',
        date: '2024.01.01',
        level: Level.Local,
        round: Round.School,
        subject: ['Math'],
        teacher: ['Teacher'],
        forms: [Form.Written],
        result: { position: 1, specialPrize: false, compliment: false, nextRound: false },
        other: 'Notes',
        participants: []
      })),
      createCompetition: jest.fn(),
      updateCompetition: jest.fn(),
      deleteCompetition: jest.fn().mockReturnValue(of({}))
    };

    notificationService = {
      success: jest.fn(),
      error: jest.fn()
    };

    router = {
      navigate: jest.fn()
    };

    participantService = {
      initialize: jest.fn(),
      clearParticipants: jest.fn(),
      getParticipantsForSubmission: jest.fn().mockReturnValue([{ studentId: 1 }]),
      participants$: new BehaviorSubject([])
    };

    currentUserSubject = new BehaviorSubject({ role: Role.ADMIN, id: 1 });
    authService = {
      $currentUser: currentUserSubject.asObservable()
    };

    await TestBed.configureTestingModule({
      imports: [CompetitionEditorComponent, NoopAnimationsModule],
      providers: [
        { provide: CompetitionService, useValue: competitionService },
        { provide: NotificationService, useValue: notificationService },
        { provide: Router, useValue: router },
        { provide: AuthService, useValue: authService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute(null) },
      ]
    }).overrideComponent(CompetitionEditorComponent, {
      set: {
        providers: [
          { provide: ParticipantService, useValue: participantService },
          CompetitionFormService
        ]
      }
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
      expect(component.formService.competitionForm.valid).toBeFalsy();
    });

    it('should require name, location, subject, date, level, and round', () => {
      const controls = component.formService.competitionForm.controls;
      expect(controls.name.errors?.['required']).toBeTruthy();
      expect(controls.location.errors?.['required']).toBeTruthy();
      expect(controls.date.errors?.['required']).toBeTruthy();
      expect(controls.level.errors?.['required']).toBeTruthy();
      expect(controls.round.errors?.['required']).toBeTruthy();
    });

    it('should validate date format (schoolYearValidator)', () => {
      currentUserSubject.next({ role: Role.CONTRIBUTOR, id: 1 });
      const dateControl = component.formService.competitionForm.controls.date;
      dateControl.setValue('2020.01.01');
      expect(dateControl.errors?.['schoolYear']).toBeTruthy();
    });
  });

  describe('OKTV Logic', () => {
    it('should update filtered rounds when OKTV is toggled ON', () => {
      component.formService.toggleOktv(true);
      expect(component.formService.filteredRounds.some(r => r.value === Round.OktvRoundOne)).toBeTruthy();
      expect(component.formService.filteredRounds.some(r => r.value === Round.School)).toBeFalsy();
    });

    it('should update filtered rounds when level changes', () => {
      component.formService.level.setValue(Level.Local);
      fixture.detectChanges();
      expect(component.formService.filteredRounds.some(r => r.value === Round.School)).toBeTruthy();
      expect(component.formService.filteredRounds.some(r => r.value === Round.National)).toBeFalsy();
    });
  });

  describe('Display Modes', () => {
    it('should disable controls in show mode', () => {
      component.$displayMode.next('show');
      fixture.detectChanges();
      expect(component.formService.name.disabled).toBeTruthy();
      expect(component.formService.location.disabled).toBeTruthy();
    });

    it('should enable controls in edit mode', () => {
      component.$displayMode.next('edit');
      fixture.detectChanges();
      expect(component.formService.name.enabled).toBeTruthy();
    });
  });

  describe('Form Array Manipulation', () => {
    it('should add and remove subjects', () => {
      const initialCount = component.formService.subject.length;
      component.formService.addSubject('New Subject');
      expect(component.formService.subject.length).toBe(initialCount + 1);
      expect(component.formService.subject.at(initialCount).value).toBe('New Subject');

      component.formService.removeSubject(initialCount);
      expect(component.formService.subject.length).toBe(initialCount);
    });

    it('should add and remove teachers', () => {
      component.formService.addTeacher('New Teacher');
      expect(component.formService.teacher.length).toBe(1);
      expect(component.formService.teacher.at(0).value).toBe('New Teacher');

      component.formService.removeTeacher(0);
      expect(component.formService.teacher.length).toBe(0);
    });

    it('should add and remove forms', () => {
      const initialCount = component.formService.forms.length;
      component.formService.addForm(Form.Oral);
      expect(component.formService.forms.length).toBe(initialCount + 1);
      expect(component.formService.forms.at(initialCount).value).toBe(Form.Oral);

      component.formService.removeForm(initialCount);
      expect(component.formService.forms.length).toBe(initialCount);
    });
  });

  describe('Round Filtering Logic', () => {
    it('should filter rounds for Local level', () => {
      component.formService.level.setValue(Level.Local);
      expect(component.formService.filteredRounds.every((r: any) =>
        r.value === Round.School || r.value === Round.Regional
      )).toBeTruthy();
    });

    it('should filter rounds for National level', () => {
      component.formService.level.setValue(Level.National);
      expect(component.formService.filteredRounds.every((r: any) =>
        r.value === Round.School || r.value === Round.Regional || r.value === Round.State || r.value === Round.National
      )).toBeTruthy();
    });

    it('should reset round if not valid for new level', () => {
      component.formService.level.setValue(Level.National);
      component.formService.round.setValue(Round.National);

      component.formService.level.setValue(Level.Local);
      expect(component.formService.round.value).toBeNull();
    });

    it('should filter for OKTV rounds when OKTV is enabled', () => {
      component.formService.toggleOktv(true);
      expect(component.formService.filteredRounds.every((r: any) =>
        [Round.OktvRoundOne, Round.OktvRoundTwo, Round.OktvFinal].includes(r.value)
      )).toBeTruthy();
    });

    it('should set level to National and disable it when OKTV is enabled', () => {
      component.formService.level.setValue(Level.Local);
      component.formService.toggleOktv(true);
      expect(component.formService.level.value).toBe(Level.National);
      expect(component.formService.level.disabled).toBeTruthy();

      component.formService.toggleOktv(false);
      expect(component.formService.level.disabled).toBeFalsy();
    });

    it('should reset round when OKTV is toggled', () => {
      component.formService.level.setValue(Level.Local);
      component.formService.round.setValue(Round.School);
      component.formService.toggleOktv(true);
      expect(component.formService.round.value).toBeNull();
    });

    it('should filter rounds for State level', () => {
      component.formService.level.setValue(Level.State);
      const values = component.formService.filteredRounds.map(r => r.value);
      expect(values).toContain(Round.School);
      expect(values).toContain(Round.State);
      expect(values).toContain(Round.Regional);
      expect(values.length).toBe(3);
    });


  });

  describe('Form Restoration', () => {
    it('should restore form to original values when showMode is called', () => {
      const originalCompetition = {
        name: 'Original',
        location: 'Original Loc',
        date: '2024.01.01',
        level: Level.Local,
        round: Round.School,
        subject: ['Math'],
        teacher: ['Teacher'],
        forms: [Form.Written],
        result: { position: 1, specialPrize: false, compliment: false, nextRound: false },
        other: 'Notes'
      };

      (component as any).competition$.next(originalCompetition as any);
      component.formService.name.setValue('Modified');
      component.showMode();

      expect(component.formService.name.value).toBe('Original');
      expect(component.$displayMode.value).toBe('show');
    });
  });

  describe('Role-based Validation & UI', () => {
    it('should allow future dates for ADMIN', () => {
      currentUserSubject.next({ role: Role.ADMIN, id: 1 });
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const dateStr = `${futureDate.getFullYear()}.09.01`;

      component.formService.date.setValue(dateStr);
      expect(component.formService.date.errors?.['futureDate']).toBeFalsy();
    });

    it('should NOT allow future dates for CONTRIBUTOR', () => {
      currentUserSubject.next({ role: Role.CONTRIBUTOR, id: 2 });
      const futureDate = new Date();
      futureDate.setFullYear(futureDate.getFullYear() + 1);
      const dateStr = `${futureDate.getFullYear()}.09.01`;

      component.formService.date.setValue(dateStr);
      expect(component.formService.date.errors?.['futureDate']).toBeTruthy();
    });

    describe('Deletable logic', () => {
      beforeEach(() => {
        const competition = { creatorId: 10, date: `${getCurrentSchoolYear()}.10.01` };
        (component as any).competition$.next(competition);
      });

      it('should be deletable for ADMIN', (done) => {
        currentUserSubject.next({ role: Role.ADMIN, id: 1 });
        component.isCompetitionModifiable$.pipe(take(1)).subscribe((deletable: boolean) => {
          expect(deletable).toBe(true);
          done();
        });
      });

      it('should be deletable for Creator CONTRIBUTOR', (done) => {
        currentUserSubject.next({ role: Role.CONTRIBUTOR, id: 10 });
        component.isCompetitionModifiable$.pipe(take(1)).subscribe((deletable: boolean) => {
          expect(deletable).toBe(true);
          done();
        });
      });

      it('should NOT be deletable for other CONTRIBUTOR', (done) => {
        currentUserSubject.next({ role: Role.CONTRIBUTOR, id: 11 });
        component.isCompetitionModifiable$.pipe(take(1)).subscribe((deletable: boolean) => {
          expect(deletable).toBe(false);
          done();
        });
      });
    });
  });

  describe('Submission', () => {
    beforeEach(() => {
      component.formService.name.setValue('Test');
      component.formService.location.setValue('Test');
      component.formService.date.setValue('2026.01.01');
      component.formService.level.setValue(Level.State);
      component.formService.round.setValue(Round.State);
      component.formService.subject.at(0).setValue('Math');
      component.formService.forms.at(0).setValue(Form.Written);
    });

    it('should call createCompetition on submit when ID is null', fakeAsync(() => {
      competitionService.createCompetition.mockReturnValue(of({}));
      component.onSubmit();
      tick();
      expect(competitionService.createCompetition).toHaveBeenCalled();
      expect(notificationService.success).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/competition']);
    }));

    it('should call updateCompetition on submit when ID is provided', fakeAsync(() => {
      competitionService.updateCompetition.mockReturnValue(of({}));
      // Mock ActivatedRoute to provide an ID
      const activatedRoute = TestBed.inject(ActivatedRoute);
      (activatedRoute.snapshot.paramMap.get as jest.Mock).mockReturnValue('1');

      // Re-initialize to trigger ngOnInit with ID
      component.ngOnInit();
      tick();
      fixture.detectChanges();

      component.onSubmit();
      tick();
      expect(competitionService.updateCompetition).toHaveBeenCalled();
      expect(notificationService.success).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/competition']);
    }));

    it('should show error notification on failed submission', fakeAsync(() => {
      competitionService.createCompetition.mockReturnValue(throwError(() => new Error('UNIQUE API ERROR')));
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

  describe('Initialization with ID', () => {
    it('should load competition data when ID is provided in route', fakeAsync(() => {
      const activatedRoute = TestBed.inject(ActivatedRoute);
      (activatedRoute.snapshot.paramMap.get as jest.Mock).mockReturnValue('1');

      component.ngOnInit();
      tick();
      fixture.detectChanges();

      expect(competitionService.getCompetition).toHaveBeenCalledWith(1);
      expect(component.formService.name.value).toBe('Test Competition');
    }));

    it('should handle error when competition loading fails', fakeAsync(() => {
      const activatedRoute = TestBed.inject(ActivatedRoute);
      (activatedRoute.snapshot.paramMap.get as jest.Mock).mockReturnValue('999');
      competitionService.getCompetition.mockReturnValue(throwError(() => new Error('Not Found')));

      component.ngOnInit();
      tick();

      expect(notificationService.error).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/competition']);
    }));
  });

  describe('Deletion', () => {
    beforeEach(() => {
      const activatedRoute = TestBed.inject(ActivatedRoute);
      (activatedRoute.snapshot.paramMap.get as jest.Mock).mockReturnValue('1');
      component.ngOnInit();
    });

    it('should call deleteCompetition and navigate back on success', fakeAsync(() => {
      // Mock confirm
      window.confirm = jest.fn().mockReturnValue(true);

      component.deleteCompetition();
      tick();

      expect(competitionService.deleteCompetition).toHaveBeenCalledWith(1);
      expect(notificationService.success).toHaveBeenCalled();
      expect(router.navigate).toHaveBeenCalledWith(['/competition']);
    }));

    it('should handle error on deletion failure', fakeAsync(() => {
      window.confirm = jest.fn().mockReturnValue(true);
      competitionService.deleteCompetition.mockReturnValue(throwError(() => new Error('Delete failed')));

      component.deleteCompetition();
      tick();

      expect(notificationService.error).toHaveBeenCalled();
    }));

    it('should not call delete if user cancels confirmation', fakeAsync(() => {
      window.confirm = jest.fn().mockReturnValue(false);

      component.deleteCompetition();
      tick();

      expect(competitionService.deleteCompetition).not.toHaveBeenCalled();
    }));
  });
});

function mockActivatedRoute(id: string | null) {
  return {
    snapshot: {
      paramMap: {
        get: jest.fn().mockReturnValue(id)
      }
    }
  }
}

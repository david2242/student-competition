import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompetitionListComponent } from './competition-list.component';
import { of, BehaviorSubject } from "rxjs";
import { CompetitionService } from "@/app/services/competition.service";
import { Router } from "@angular/router";
import { NotificationService } from "@/app/services/notification.service";
import { AuthService } from "@/app/services/auth.service";

const mockCompetitionService = {
  getCompetitions: () => of([])
};

const mockNotificationService = {
  error: jest.fn(),
  success: jest.fn()
};

const mockAuthService = {
  $currentUser: new BehaviorSubject(null)
};

const mockRouter = {
  navigate: jest.fn()
};

describe('CompetitionListComponent', () => {
  let component: CompetitionListComponent;
  let fixture: ComponentFixture<CompetitionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompetitionListComponent],
      providers: [
        { provide: CompetitionService, useValue: mockCompetitionService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: AuthService, useValue: mockAuthService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CompetitionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompetitionListComponent } from './competition-list.component';
import { of, BehaviorSubject } from "rxjs";
import { CompetitionService } from "@/app/services/competition.service";
import { RouterTestingModule } from "@angular/router/testing";
import { NotificationService } from "@/app/services/notification.service";
import { AuthService } from "@/app/services/auth.service";

const mockCompetitionService = {
  searchCompetitions: () => of([])
};

const mockNotificationService = {
  error: jest.fn(),
  success: jest.fn()
};

const mockAuthService = {
  $currentUser: new BehaviorSubject(null)
};


describe('CompetitionListComponent', () => {
  let component: CompetitionListComponent;
  let fixture: ComponentFixture<CompetitionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompetitionListComponent, RouterTestingModule],
      providers: [
        { provide: CompetitionService, useValue: mockCompetitionService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: AuthService, useValue: mockAuthService },
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

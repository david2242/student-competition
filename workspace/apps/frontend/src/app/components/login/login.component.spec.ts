import { ComponentFixture, TestBed } from '@angular/core/testing';
import { LoginComponent } from './login.component';
import { of } from "rxjs";
import { AuthService } from "@/app/services/auth.service";
import { Router } from "@angular/router";
import { NotificationService } from "@/app/services/notification.service";

const mockAuthService = {
  login: () => of({}),
};

const mockNotificationService = {
  success: jest.fn(),
  error: jest.fn()
};

const mockRouter = {
  navigate: jest.fn()
};

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: AuthService, useValue: mockAuthService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: Router, useValue: mockRouter }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

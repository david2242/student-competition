import { TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { of } from 'rxjs';
import { CompetitionService } from "@/app/services/competition.service";
import { AppComponent } from './app.component';
import { AuthService } from "@/app/services/auth.service";

describe('AppComponent', () => {
  beforeEach(async () => {

    await TestBed.configureTestingModule({
      imports: [AppComponent, RouterTestingModule],
      providers: [
        { provide: CompetitionService, useValue: mockCompetitionService },
        { provide: AuthService, useValue: mockAuthService }
      ]
    }).compileComponents();
  });

  it(`should have as title 'frontend'`, () => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.componentInstance;
    expect(app).toBeDefined();
  });
});

const mockCompetitionService = {
  getCompetitions: () => of([])
};
const mockAuthService = {
  info: () => of()
};

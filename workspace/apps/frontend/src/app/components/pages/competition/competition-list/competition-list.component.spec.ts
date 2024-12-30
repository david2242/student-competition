import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompetitionListComponent } from './competition-list.component';
import { of } from "rxjs";
import { CompetitionService } from "@/app/services/competition.service";

describe('CompetitionListComponent', () => {
  let component: CompetitionListComponent;
  let fixture: ComponentFixture<CompetitionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompetitionListComponent],
      providers: [
        { provide: CompetitionService, useValue: mockCompetitionService }
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

const mockCompetitionService = {
  getCompetitions: () => of()
};

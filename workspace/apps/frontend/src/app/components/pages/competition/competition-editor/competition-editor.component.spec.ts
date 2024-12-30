import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from "rxjs";
import { CompetitionService } from "@/app/services/competition.service";
import { CompetitionEditorComponent } from './competition-editor.component';

describe('CompetitionEditorComponent', () => {
  let component: CompetitionEditorComponent;
  let fixture: ComponentFixture<CompetitionEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompetitionEditorComponent],
      providers: [ { provide: CompetitionService, useValue: {mockCompetitionService} } ]
    }).compileComponents();

    fixture = TestBed.createComponent(CompetitionEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

const mockCompetitionService = {
  createCompetitions: () => of()
};

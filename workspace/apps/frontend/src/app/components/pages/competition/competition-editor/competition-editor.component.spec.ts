import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of } from "rxjs";
import { ActivatedRoute } from "@angular/router";
import { CompetitionService } from "@/app/services/competition.service";
import { CompetitionEditorComponent } from './competition-editor.component';

describe('CompetitionEditorComponent', () => {
  let component: CompetitionEditorComponent;
  let fixture: ComponentFixture<CompetitionEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompetitionEditorComponent],
      providers: [
        { provide: CompetitionService, useValue: {mockCompetitionService} },
        { provide: ActivatedRoute, useValue: mockActivatedRoute(null) }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(CompetitionEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('if the route param has no id, then the component id should be null', () => {
    expect(component.id).toBe(null);
  });
});

const mockCompetitionService = {
  createCompetitions: () => of()
};

function mockActivatedRoute(id: string | null) {
  return {
    snapshot: {
      paramMap: {
        get: (key: string) => id // Simulate id=1 in the route param
      }
    }
  }
}

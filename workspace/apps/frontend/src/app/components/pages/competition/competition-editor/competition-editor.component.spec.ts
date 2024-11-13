import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompetitionEditorComponent } from './competition-editor.component';

describe('CompetitionEditorComponent', () => {
  let component: CompetitionEditorComponent;
  let fixture: ComponentFixture<CompetitionEditorComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompetitionEditorComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CompetitionEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

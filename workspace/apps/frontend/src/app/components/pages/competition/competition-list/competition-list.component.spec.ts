import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompetitionListComponent } from './competition-list.component';

describe('CompetitionListComponent', () => {
  let component: CompetitionListComponent;
  let fixture: ComponentFixture<CompetitionListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CompetitionListComponent],
    }).compileComponents();

    fixture = TestBed.createComponent(CompetitionListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { CompetitionResultComponent } from './competition-result.component';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { By } from '@angular/platform-browser';

function buildResultFormGroup(overrides: Partial<{
    position: number | null;
    specialPrize: boolean;
    compliment: boolean;
    nextRound: boolean;
}> = {}) {
    return new FormGroup({
        position: new FormControl<number | null>(overrides.position ?? null),
        specialPrize: new FormControl<boolean>(overrides.specialPrize ?? false, { nonNullable: true }),
        compliment: new FormControl<boolean>(overrides.compliment ?? false, { nonNullable: true }),
        nextRound: new FormControl<boolean>(overrides.nextRound ?? false, { nonNullable: true }),
    });
}

describe('CompetitionResultComponent', () => {
    let component: CompetitionResultComponent;
    let fixture: ComponentFixture<CompetitionResultComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [CompetitionResultComponent, ReactiveFormsModule, NoopAnimationsModule],
        }).compileComponents();

        fixture = TestBed.createComponent(CompetitionResultComponent);
        component = fixture.componentInstance;
        component.formGroup = buildResultFormGroup({ position: 2, specialPrize: true }) as any;
        component.displayMode = 'show';
        fixture.detectChanges();
    });

    describe('Getters', () => {
        it('should expose position control with correct value', () => {
            component.formGroup = buildResultFormGroup({ position: 3 }) as any;
            fixture.detectChanges();
            expect(component.position.value).toBe(3);
        });

        it('should expose specialPrize control', () => {
            component.formGroup = buildResultFormGroup({ specialPrize: true }) as any;
            fixture.detectChanges();
            expect(component.specialPrize.value).toBe(true);
        });

        it('should expose compliment control', () => {
            component.formGroup = buildResultFormGroup({ compliment: true }) as any;
            fixture.detectChanges();
            expect(component.compliment.value).toBe(true);
        });

        it('should expose nextRound control', () => {
            component.formGroup = buildResultFormGroup({ nextRound: true }) as any;
            fixture.detectChanges();
            expect(component.nextRound.value).toBe(true);
        });
    });

    describe('Show mode', () => {
        beforeEach(() => {
            component.displayMode = 'show';
            fixture.detectChanges();
        });

        it('should render the position input as readonly', () => {
            const input = fixture.debugElement.query(By.css('#position'));
            expect(input.nativeElement.readOnly).toBe(true);
        });

        it('should pass displayMode show to the component', () => {
            expect(component.displayMode).toBe('show');
        });
    });

    describe('Edit mode', () => {
        beforeEach(() => {
            component.displayMode = 'edit';
            fixture.detectChanges();
        });

        it('should render the position input as editable', () => {
            const input = fixture.debugElement.query(By.css('#position'));
            expect(input.nativeElement.readOnly).toBe(false);
        });

        it('should pass displayMode edit to the component', () => {
            expect(component.displayMode).toBe('edit');
        });
    });
});

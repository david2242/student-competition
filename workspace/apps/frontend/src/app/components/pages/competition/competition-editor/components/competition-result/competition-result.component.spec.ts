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

    async function setup(displayMode: 'show' | 'edit', formValues = {}) {
        await TestBed.configureTestingModule({
            imports: [CompetitionResultComponent, ReactiveFormsModule, NoopAnimationsModule],
        }).compileComponents();

        fixture = TestBed.createComponent(CompetitionResultComponent);
        component = fixture.componentInstance;
        component.formGroup = buildResultFormGroup(formValues) as any;
        component.displayMode = displayMode;
        fixture.detectChanges();
    }

    describe('Getters', () => {
        it('should expose position control', async () => {
            await setup('show', { position: 3 });
            expect(component.position.value).toBe(3);
        });

        it('should expose specialPrize control', async () => {
            await setup('show', { specialPrize: true });
            expect(component.specialPrize.value).toBe(true);
        });

        it('should expose compliment control', async () => {
            await setup('show', { compliment: true });
            expect(component.compliment.value).toBe(true);
        });

        it('should expose nextRound control', async () => {
            await setup('show', { nextRound: true });
            expect(component.nextRound.value).toBe(true);
        });
    });

    describe('Show mode', () => {
        it('should render the position input as readonly', async () => {
            await setup('show', { position: 2 });
            const input = fixture.debugElement.query(By.css('#position'));
            expect(input.nativeElement.readOnly).toBe(true);
        });

        it('should render checkboxes as disabled', async () => {
            await setup('show', { specialPrize: true });
            const checkbox = fixture.debugElement.query(By.css('#specialPrize'));
            expect(checkbox.nativeElement.getAttribute('disabled')).not.toBeNull();
        });
    });

    describe('Edit mode', () => {
        it('should render the position input as editable', async () => {
            await setup('edit', { position: 1 });
            const input = fixture.debugElement.query(By.css('#position'));
            expect(input.nativeElement.readOnly).toBe(false);
        });

        it('should render checkboxes as enabled', async () => {
            await setup('edit', { specialPrize: false });
            const checkbox = fixture.debugElement.query(By.css('#specialPrize'));
            expect(checkbox.nativeElement.getAttribute('disabled')).toBeNull();
        });
    });
});

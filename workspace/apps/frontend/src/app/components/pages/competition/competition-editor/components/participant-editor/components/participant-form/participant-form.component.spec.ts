import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ParticipantFormComponent } from './participant-form.component';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { CompetitionParticipant } from '@/app/components/pages/competition/competition-editor';

const CLASS_YEARS = [9, 10, 11, 12];
const CLASS_LETTERS = ['a', 'b', 'c'];

describe('ParticipantFormComponent', () => {
    let component: ParticipantFormComponent;
    let fixture: ComponentFixture<ParticipantFormComponent>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [ParticipantFormComponent, NoopAnimationsModule],
        }).compileComponents();

        fixture = TestBed.createComponent(ParticipantFormComponent);
        component = fixture.componentInstance;
        component.classYears = CLASS_YEARS;
        component.classLetters = CLASS_LETTERS;
    });

    it('should create', () => {
        fixture.detectChanges();
        expect(component).toBeTruthy();
    });

    describe('Form initialisation', () => {
        it('should initialise empty when no initialData is provided', () => {
            fixture.detectChanges();
            expect(component.form.value.firstName).toBe('');
            expect(component.form.value.lastName).toBe('');
            expect(component.form.value.classYear).toBeNull();
            expect(component.form.value.classLetter).toBe('');
        });

        it('should pre-fill firstName and lastName from initialData', () => {
            component.initialData = { firstName: 'János', lastName: 'Kovács' };
            fixture.detectChanges();
            expect(component.form.value.firstName).toBe('János');
            expect(component.form.value.lastName).toBe('Kovács');
        });

        it('should pre-fill all fields from initialData including classYear/classLetter', () => {
            const data: Partial<CompetitionParticipant> = {
                firstName: 'Anna',
                lastName: 'Nagy',
                classYear: 10,
                classLetter: 'b'
            };
            component.initialData = data;
            fixture.detectChanges();
            expect(component.form.value.firstName).toBe('Anna');
            expect(component.form.value.lastName).toBe('Nagy');
            expect(component.form.value.classYear).toBe(10);
            expect(component.form.value.classLetter).toBe('b');
        });
    });

    describe('onSubmit', () => {
        beforeEach(() => {
            fixture.detectChanges();
        });

        it('should not emit when form is invalid', () => {
            const emitSpy = jest.spyOn(component.submitForm, 'emit');
            component.onSubmit();
            expect(emitSpy).not.toHaveBeenCalled();
        });

        it('should mark all as touched when submitting an invalid form', () => {
            component.onSubmit();
            expect(component.form.touched).toBeTruthy();
        });

        it('should emit the correct participant shape on valid submit', () => {
            component.form.setValue({
                firstName: 'Béla',
                lastName: 'Tóth',
                classYear: 9,
                classLetter: 'a'
            });
            const emitSpy = jest.spyOn(component.submitForm, 'emit');
            component.onSubmit();
            expect(emitSpy).toHaveBeenCalledWith({
                firstName: 'Béla',
                lastName: 'Tóth',
                classYear: 9,
                classLetter: 'a'
            });
        });

        it('should reset the form after a valid submit', () => {
            component.form.setValue({
                firstName: 'Béla',
                lastName: 'Tóth',
                classYear: 9,
                classLetter: 'a'
            });
            component.onSubmit();
            expect(component.form.value.firstName).toBeFalsy();
        });
    });

    describe('onCancel', () => {
        it('should emit the cancel event', () => {
            fixture.detectChanges();
            const emitSpy = jest.spyOn(component.cancel, 'emit');
            component.onCancel();
            expect(emitSpy).toHaveBeenCalled();
        });
    });
});

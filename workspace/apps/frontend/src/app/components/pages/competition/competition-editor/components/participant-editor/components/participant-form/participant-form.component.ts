import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators, FormsModule, FormControl } from '@angular/forms';
import { CompetitionParticipant } from "@/app/components/pages/competition/competition-editor";

@Component({
  selector: 'app-participant-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  template: `
    <div class="card mb-3">
      <div class="card-body">
        <h5 class="card-title">Diák hozzáadása</h5>
        <form [formGroup]="form" (ngSubmit)="onSubmit()">
          <div class="row g-3">
            <div class="col-md-6">
              <label for="lastName" class="form-label">Vezetéknév</label>
              <input
                type="text"
                id="lastName"
                class="form-control"
                formControlName="lastName"
                (focus)="onFieldFocus()"
                [class.is-invalid]="form.get('lastName')?.invalid && form.get('lastName')?.touched"
              >
              @if (form.get('lastName')?.invalid && form.get('lastName')?.touched) {
                <div class="invalid-feedback">
                  Kérem adja meg a vezetéknevet
                </div>
              }
            </div>
            <div class="col-md-6">
              <label for="firstName" class="form-label">Keresztnév</label>
              <input
                type="text"
                id="firstName"
                class="form-control"
                formControlName="firstName"
                (focus)="onFieldFocus()"
                [class.is-invalid]="form.get('firstName')?.invalid && form.get('firstName')?.touched"
              >
              @if (form.get('firstName')?.invalid && form.get('firstName')?.touched) {
                <div class="invalid-feedback">
                  Kérem adja meg a keresztnevet
                </div>
              }
            </div>
            <div class="col-md-6">
              <label for="classYear" class="form-label">Osztály évfolyam</label>
              <select
                id="classYear"
                class="form-select"
                formControlName="classYear"
                (focus)="onFieldFocus()"
                [class.is-invalid]="form.get('classYear')?.invalid && form.get('classYear')?.touched"
              >
                <option [ngValue]="null" disabled>Válasszon évfolyamot...</option>
                @for (year of classYears; track year) {
                  <option [value]="year">{{ year }}. évfolyam</option>
                }
              </select>
              @if (form.get('classYear')?.invalid && form.get('classYear')?.touched) {
                <div class="invalid-feedback">
                  Kérem válasszon évfolyamot
                </div>
              }
            </div>
            <div class="col-md-6">
              <label for="classLetter" class="form-label">Osztály betűjele</label>
              <select
                id="classLetter"
                class="form-select"
                formControlName="classLetter"
                (focus)="onFieldFocus()"
                [class.is-invalid]="form.get('classLetter')?.invalid && form.get('classLetter')?.touched"
              >
                <option value="" disabled>Válasszon osztályt...</option>
                @for (letter of classLetters; track letter) {
                  <option [value]="letter">{{ letter | uppercase }} osztály</option>
                }
              </select>
              @if (form.get('classLetter')?.invalid && form.get('classLetter')?.touched) {
                <div class="invalid-feedback">
                  Kérem válasszon osztályt
                </div>
              }
            </div>
            <div class="col-12">
              <button type="submit" class="btn btn-primary me-2" [disabled]="form.invalid">
                Hozzáadás
              </button>
              <button type="button" class="btn btn-outline-secondary" (click)="onCancel()">
                Mégse
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  `
})
export class ParticipantFormComponent implements OnInit {
  @Input() classYears: number[] = [];
  @Input() classLetters: string[] = [];
  @Input() participant?: CompetitionParticipant;
  @Input() initialData: { firstName?: string; lastName?: string } = {};
  @Output() submitForm = new EventEmitter<CompetitionParticipant>();
  @Output() cancel = new EventEmitter<void>();
  @Output() formInteraction = new EventEmitter<void>();

  form!: FormGroup<{
    firstName: FormControl<string | null>;
    lastName: FormControl<string | null>;
    classYear: FormControl<number | null>;
    classLetter: FormControl<string | null>;
  }>;

  constructor(private fb: FormBuilder) { }

  ngOnInit(): void {
    this.form = this.fb.group({
      firstName: [this.initialData.firstName || this.participant?.firstName || '', [
        Validators.required,
        Validators.maxLength(50)
      ]],
      lastName: [this.initialData.lastName || this.participant?.lastName || '', [
        Validators.required,
        Validators.maxLength(50)
      ]],
      classYear: [this.participant?.classYear || null, Validators.required],
      classLetter: [this.participant?.classLetter || '', Validators.required]
    });
  }

  onSubmit(): void {
    if (this.form.valid) {
      const formValue = this.form.getRawValue();
      const participant: CompetitionParticipant = {
        firstName: formValue.firstName || '',
        lastName: formValue.lastName || '',
        classYear: formValue.classYear || 0,
        classLetter: formValue.classLetter || ''
      };
      this.submitForm.emit(participant);
      this.form.reset();
    } else {
      this.form.markAllAsTouched();
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onFieldFocus(): void {
    this.formInteraction.emit();
  }
}

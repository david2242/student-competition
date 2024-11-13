import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-competition-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './competition-editor.component.html',
  styleUrl: './competition-editor.component.css',
})
export class CompetitionEditorComponent implements OnInit {

  competitionForm = new FormGroup({
        name: new FormControl('', Validators.required),
        location: new FormControl('', Validators.required),
        subject: new FormArray([(new FormControl('', Validators.required))], Validators.required),
        teacher: new FormArray([]),
        year: new FormControl('', Validators.required),
        level: new FormControl('local', Validators.required),
        round: new FormControl('school', Validators.required),
        form: new FormArray([(new FormControl('', Validators.required))], Validators.required),
        result: new FormGroup({
          enablePosition: new FormControl(false, {nonNullable: true}),
          position: new FormControl(null, Validators.required),
          specialPrize: new FormControl(false),
          compliment: new FormControl(false),
          nextRound: new FormControl(false),
        }),
        note: new FormControl(''),
  });

  ngOnInit(): void {
    const positionControl = this.competitionForm.controls.result.controls.position;
    positionControl?.disable();
    this.competitionForm.get('result.enablePosition')?.valueChanges.subscribe((checked: boolean) => {
      if (checked) {
        positionControl?.enable();
      } else {
        positionControl?.disable();
      }
    })
  }

  get name(): FormControl {
    return this.competitionForm.get('name') as FormControl;
  }

  get location(): FormControl {
    return this.competitionForm.get('location') as FormControl;
  }

  get year(): FormControl {
    return this.competitionForm.get('year') as FormControl;
  }

  get level(): FormControl {
    return this.competitionForm.get('level') as FormControl;
  }

  get round(): FormControl {
    return this.competitionForm.get('round') as FormControl;
  }

  get subject() {
    return this.competitionForm.get('subject') as FormArray;
  }

  get teacher(): FormArray {
    return this.competitionForm.get('teacher') as FormArray;
  }

  get form(): FormArray {
    return this.competitionForm.get('form') as FormArray;
  }

  addSubject(subject: string): void {
    this.subject.push(new FormControl(subject, Validators.required));
  }

  addTeacher(teacher: string): void {
    this.teacher.push(new FormControl(teacher, Validators.required));
  }

  addForm(form: string): void {
    this.form.push(new FormControl(form, Validators.required));
  }

  onSubmit(): void {
    if (this.competitionForm.valid) {
      const competition = this.competitionForm.value;
      console.log('Competition submitted:', competition);
    } else {
      console.log('Form is invalid', this.competitionForm);
    }
  }

  removeSubject(i: number) {
    this.subject.removeAt(i);
  }

  removeTeacher(i: number) {
    this.teacher.removeAt(i);
  }

  removeForm(i: number) {
    this.form.removeAt(i);
  }
}

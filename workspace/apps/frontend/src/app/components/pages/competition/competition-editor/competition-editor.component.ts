import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Subscription } from "rxjs";
import { Form, Level, Round } from "@/app/models/competition.model";
import { CompetitionService } from "@/app/services/competition.service";

@Component({
  selector: 'app-competition-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './competition-editor.component.html',
  styleUrl: './competition-editor.component.css',
})
export class CompetitionEditorComponent implements OnInit, OnDestroy {

  competitionService = inject(CompetitionService);
  positionEnablerSubsripction?: Subscription;
  protected readonly Level = Level;
  protected readonly Form = Form;
  protected readonly Round = Round;

  competitionForm = new FormGroup({
        name: new FormControl<string>('', {nonNullable: true, validators: [Validators.required]}),
        location: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
        subject: new FormArray([(new FormControl('', {nonNullable: true, validators: [Validators.required]}))], Validators.required),
        teacher: new FormArray([]),
        year: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
        level: new FormControl<Level>(Level.Local, {nonNullable: true, validators: [Validators.required]}),
        round: new FormControl<Round>(Round.School, {nonNullable: true, validators: [Validators.required]}),
        form: new FormArray([(new FormControl<Form>(Form.Written, {nonNullable: true, validators: [Validators.required]}))], Validators.required),
        result: new FormGroup({
          enablePosition: new FormControl(false, {nonNullable: true}),
          position: new FormControl({value: null, disabled: true}, {nonNullable: true, validators: [Validators.required]}),
          specialPrize: new FormControl(false, {nonNullable: true}),
          compliment: new FormControl(false, {nonNullable: true}),
          nextRound: new FormControl(false, {nonNullable: true}),
        }),
        other: new FormControl('', {nonNullable: true}),
  });

  ngOnInit(): void {
    const positionControl = this.competitionForm.controls.result.controls.position;
    this.positionEnablerSubsripction = this.competitionForm.get('result.enablePosition')?.valueChanges.subscribe((checked: boolean) => {
      if (checked) {
        positionControl?.enable();
      } else {
        positionControl?.reset();
        positionControl?.disable();
      }
    })
  }

  ngOnDestroy(): void {
    this.positionEnablerSubsripction?.unsubscribe();
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
      const competition = this.competitionForm.getRawValue();
      this.competitionService.createCompetition(competition).subscribe(() => this.competitionForm.reset());
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

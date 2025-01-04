import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from "@angular/router";
import { BehaviorSubject, Subscription } from "rxjs";
import { Competition, Form, Level, Round } from "@/app/models/competition.model";
import { CompetitionService } from "@/app/services/competition.service";
import { subjects } from "./subjects";
import { teachers } from "./teachers";

@Component({
  selector: 'app-competition-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './competition-editor.component.html',
  styleUrl: './competition-editor.component.css',
})
export class CompetitionEditorComponent implements OnInit, OnDestroy {

  competitionService = inject(CompetitionService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  competition?: Competition;
  positionEnablerSubsripction?: Subscription;
  id: number | null = null;
  $displayMode = new BehaviorSubject<'show' | 'edit'>('show');
  subjects = subjects;
  teachers = teachers;
  protected readonly Level = Level;
  protected readonly Form = Form;
  protected readonly Round = Round;

  competitionForm = new FormGroup({
        name: new FormControl<string>('', {nonNullable: true, validators: [Validators.required]}),
        location: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
        subject: new FormArray([(new FormControl('', {nonNullable: true, validators: [Validators.required]}))], Validators.required),
        teacher: new FormArray([(new FormControl('', {nonNullable: true, validators: [Validators.required]}))], Validators.required),
        year: new FormControl('', {nonNullable: true, validators: [Validators.required]}),
        level: new FormControl<Level>(Level.Local, {nonNullable: true, validators: [Validators.required]}),
        round: new FormControl<Round>(Round.School, {nonNullable: true, validators: [Validators.required]}),
        form: new FormArray([(new FormControl<Form>(Form.Written, {nonNullable: true, validators: [Validators.required]}))], Validators.required),
        result: new FormGroup({
          enablePosition: new FormControl(false, {nonNullable: true}),
          position: new FormControl<number | null>({value: null, disabled: true}, {nonNullable: true, validators: [Validators.required]}),
          specialPrize: new FormControl(false, {nonNullable: true}),
          compliment: new FormControl(false, {nonNullable: true}),
          nextRound: new FormControl(false, {nonNullable: true}),
        }),
        other: new FormControl('', {nonNullable: true}),
  });

  ngOnInit(): void {
    this.saveIdFromParam();
    if (this.id) {
      this.$displayMode.next('show');
      this.competitionService.getCompetition(this.id).subscribe((competition) => {
        this.competition = competition;
        this.fillForm(competition);
      });
    } else {
      this.$displayMode.next('edit');
    }
    this.positionEnabler();
    this.$displayMode.subscribe((mode) => {
      if (mode === 'show') {
        this.toggleSelects(false);
      } else {
        this.toggleSelects(true)
      }
    })
  }

  private fillForm(competition: Competition) {
    this.competitionForm.patchValue(competition);
    this.enablePosition.setValue(competition.result.position != null);
  }

  private saveIdFromParam() {
    const idInParam = this.route.snapshot.paramMap.get('id');
    this.id = idInParam ? parseInt(idInParam) : null;
  }

  private positionEnabler() {
    const positionControl = this.competitionForm.controls.result.controls.position;
    if (positionControl.value != null) {
      this.competitionForm.controls.result.controls.enablePosition.setValue(true);
    }
    this.positionEnablerSubsripction = this.enablePosition.valueChanges.subscribe((checked: boolean) => {
      if (checked) {
        positionControl?.enable();
      } else {
        positionControl?.reset();
        positionControl?.disable();
      }
    });
  }

  ngOnDestroy(): void {
    this.positionEnablerSubsripction?.unsubscribe();
  }

  get enablePosition() {
    return this.competitionForm.get('result.enablePosition') as FormControl;
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
      this.id
        ? this.competitionService.updateCompetition(this.id, competition).subscribe(() => this.$displayMode.next('show'))
        : this.competitionService.createCompetition(competition).subscribe(() => this.$displayMode.next('show'));
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

  back() {
    this.router.navigate(['competition']);
  }

  editMode() {
    this.$displayMode.next('edit');
  }

  private toggleSelects(enable: boolean) {
    if (enable) {
      this.level.enable();
      this.round.enable();
      this.form.enable();
    } else {
      this.level.disable();
      this.round.disable();
      this.form.disable();
    }
  }

  showMode() {
    this.$displayMode.next('show');
  }

  deleteCompetition() {
    if (this.id == null) {
      return;
    }
    this.competitionService.deleteCompetition(this.id).subscribe(() => this.router.navigate(['competition']));
  }
}

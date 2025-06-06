import { ActivatedRoute, Router } from "@angular/router";
import { BehaviorSubject, Subscription } from "rxjs";
import { CommonModule } from '@angular/common';
import { Competition, Form, Level, Round } from "@/app/models/competition.model";
import { CompetitionService } from "@/app/services/competition.service";
import { Component, inject, OnDestroy, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Student } from "@/app/models/student.model";
import { ToastrService } from "ngx-toastr";
import { subjects } from "./subjects";
import { teachers } from "./teachers";

@Component({
  selector: 'app-competition-editor',
  standalone: true,
  imports: [ CommonModule, ReactiveFormsModule, FormsModule ],
  templateUrl: './competition-editor.component.html',
  styleUrl: './competition-editor.component.css',
})
export class CompetitionEditorComponent implements OnInit, OnDestroy {

  competitionService = inject(CompetitionService);
  route = inject(ActivatedRoute);
  router = inject(Router);
  toastr = inject(ToastrService);
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
    name: new FormControl<string>('', { nonNullable: true, validators: [ Validators.required ] }),
    location: new FormControl('', { nonNullable: true, validators: [ Validators.required ] }),
    subject: new FormArray([ (new FormControl('', {
      nonNullable: true,
      validators: [ Validators.required ]
    })) ], Validators.required),
    teacher: new FormArray([ (new FormControl('', { nonNullable: true })) ]),
    date: new FormControl('', { nonNullable: true, validators: [ Validators.required ] }),
    level: new FormControl<Level | null>(null,  { validators: [ Validators.required ] }),
    round: new FormControl<Round | null>(null, { validators: [ Validators.required ] }),
    form: new FormArray([ (new FormControl<Form | null>(null, {
      validators: [ Validators.required ]
    })) ], Validators.required),
    result: new FormGroup({
      enablePosition: new FormControl(false, { nonNullable: true }),
      position: new FormControl<number | null>({ value: null, disabled: true }, {
        nonNullable: true,
        validators: [ Validators.required ]
      }),
      specialPrize: new FormControl(false, { nonNullable: true }),
      compliment: new FormControl(false, { nonNullable: true }),
      nextRound: new FormControl(false, { nonNullable: true }),
    }),
    other: new FormControl('', { nonNullable: true }),
    students: new FormArray([ (new FormGroup({
      name: new FormControl('', { nonNullable: true, validators: [ Validators.required ] }),
      class: new FormControl('', { nonNullable: true, validators: [ Validators.required ] })
    })) ], Validators.required),
  });

  oktv = false;

  ngOnInit(): void {
    this.saveIdFromParam();
    if (this.id) {
      this.$displayMode.next('show');
      this.competitionService.getCompetition(this.id).subscribe({
        next: (competition) => {
          this.competition = competition;
          this.fillForm(competition);
        },
        error: () => this.toastr.error('Nem sikerült betölteni a versenyt!'),
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

    this.fillOKTV(competition.round);

    this.fillStudents();
    this.fillTeachers();
    this.fillSubjects();
    this.fillForms();
  }

  private fillStudents() {
    this.students.clear();
    this.competition?.students.forEach((student: Student) => {
      this.students.push(new FormGroup({
        name: new FormControl(student.name, { nonNullable: true, validators: [ Validators.required ] }),
        class: new FormControl(student.class, { nonNullable: true, validators: [ Validators.required ] })
      }));
    });
  }

  private fillTeachers() {
    this.teacher.clear();
    this.competition?.teacher.forEach((teacher: string) => {
      this.teacher.push(new FormControl(teacher, Validators.required));
    });
  }

  private fillSubjects() {
    this.subject.clear();
    this.competition?.subject.forEach((subject: string) => {
      this.subject.push(new FormControl(subject, Validators.required));
    });
  }

  private fillForms() {
    this.form.clear();
    this.competition?.form.forEach((form: Form | null) => {
      this.form.push(new FormControl<Form | null>(form, Validators.required));
    });
  }

  private fillOKTV(round: Round | null) {
    const oktvRounds = [Round.OktvRoundOne, Round.OktvRoundTwo, Round.OktvFinal];
    if (round) {
      this.oktv = oktvRounds.includes(round);
    }
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

  get date(): FormControl {
    return this.competitionForm.get('date') as FormControl;
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

  get students(): FormArray {
    return this.competitionForm.get('students') as FormArray;
  }

  get filteredRounds(): { value: Round, text: string }[] {
    return this.oktv
      ? [
        { value: Round.OktvRoundOne, text: 'OKTV. I. forduló' },
        { value: Round.OktvRoundTwo, text: 'OKTV. II. forduló' },
        { value: Round.OktvFinal, text: 'OKTV. döntő' }
      ]
      : [
          { value: Round.School, text: 'Iskolai forduló' },
          { value: Round.Regional, text: 'Regionális forduló' },
          { value: Round.State, text: 'Országos forduló' },
          { value: Round.National, text: 'Nemzeti forduló' }
        ]
  }

  addSubject(subject: string): void {
    this.subject.push(new FormControl(subject, Validators.required));
  }

  addTeacher(teacher: string): void {
    this.teacher.push(new FormControl(teacher));
  }

  addForm(): void {
    this.form.push(new FormControl(null, Validators.required));
  }

  onSubmit(): void {
    if (this.competitionForm.valid) {
      const competition = this.competitionForm.getRawValue();
      this.id
        ? this.competitionService.updateCompetition(this.id, competition).subscribe({
          next: () => {
            this.toastr.success('Verseny frissítve!');
            this.$displayMode.next('show')
          },
          error: () => this.toastr.error('Nem sikerült frissíteni a versenyt!'),
        })
        : this.competitionService.createCompetition(competition).subscribe({
          next: () => {
            this.toastr.success('Verseny létrehozva!');
            this.router.navigate([ 'competition' ]);
          },
          error: () => this.toastr.error('Nem sikerült létrehozni a versenyt!'),
        });
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
    this.router.navigate([ 'competition' ]);
  }

  editMode() {
    this.$displayMode.next('edit');
  }

  private toggleSelects(enable: boolean) {
    if (enable) {
      this.level.enable();
      this.round.enable();
      this.form.controls.forEach(control => control.enable());
      this.competitionForm.controls.result.enable()
      if (!this.competitionForm.controls.result.controls.position.value) {
        this.competitionForm.controls.result.controls.position.disable();
      }
    } else {
      this.level.disable();
      this.round.disable();
      this.form.controls.forEach(control => control.disable());
      this.competitionForm.controls.result.disable();
    }
  }

  showMode() {
    this.$displayMode.next('show');
  }

  deleteCompetition() {
    if (this.id == null) {
      return;
    }

    if (window.confirm('Biztosan törölni szeretnéd ezt a versenyt?')) {
      this.competitionService.deleteCompetition(this.id).subscribe(() => this.router.navigate([ 'competition' ]));
    }
  }

  addStudentRow() {
    this.students.push(new FormGroup({
      name: new FormControl('', { nonNullable: true, validators: [ Validators.required ] }),
      class: new FormControl('', { nonNullable: true, validators: [ Validators.required ] })
    }));
  }

  removeStudentRow(i: number) {
    this.students.removeAt(i);
  }

  toggleOktv($event: Event) {
    const event = $event as MouseEvent;
    const checkbox = event.target as HTMLInputElement;
    this.oktv = checkbox.checked;

    this.round.reset(null, { emitEvent: false });
  }
}



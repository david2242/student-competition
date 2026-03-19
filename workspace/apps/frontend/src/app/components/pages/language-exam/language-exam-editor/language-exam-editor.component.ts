import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { BehaviorSubject, combineLatest, map } from 'rxjs';

import { LanguageExamService, CreateLanguageExamData } from '@/app/services/language-exam.service';
import { LanguageExam, EXAM_LANGUAGES, EXAM_LEVELS, EXAM_TYPES, EXAM_BODIES } from '@/app/models/language-exam.model';
import { NotificationService } from '@/app/services/notification.service';
import { AuthService } from '@/app/services/auth.service';
import { Role } from '@/app/models/current-user';
import { StudentSearchComponent } from '@/app/components/shared/student-search/student-search.component';
import { StudentSearchResult } from '@/app/models/student.model';
import { FlatpickrDirective, provideFlatpickrDefaults } from 'angularx-flatpickr';
import { Hungarian } from 'flatpickr/dist/l10n/hu.js';
import { isInCurrentSchoolYear } from '../../competition/competition-editor/schoolYearValidator';

@Component({
  selector: 'app-language-exam-editor',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink, StudentSearchComponent, FlatpickrDirective],
  templateUrl: './language-exam-editor.component.html',
  styleUrl: './language-exam-editor.component.css',
  providers: [provideFlatpickrDefaults({
    altFormat: 'Y.m.d.',
    allowInput: true,
    locale: Hungarian
  })]
})
export class LanguageExamEditorComponent implements OnInit {
  private destroyRef = inject(DestroyRef);
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private service = inject(LanguageExamService);
  private notification = inject(NotificationService);
  private authService = inject(AuthService);

  id: number | null = null;
  $displayMode = new BehaviorSubject<'show' | 'edit'>('show');
  private exam$ = new BehaviorSubject<LanguageExam | null>(null);
  userRole: Role = Role.VIEWER;
  isLoading = false;

  selectedStudents: StudentSearchResult[] = [];

  readonly languages = EXAM_LANGUAGES;
  readonly levels = EXAM_LEVELS;
  readonly types = EXAM_TYPES;
  readonly examBodies = EXAM_BODIES;

  protected readonly Role = Role;

  form: FormGroup = this.fb.group({
    studentId: [null as number | null, Validators.required],
    language:  ['', Validators.required],
    level:     ['', Validators.required],
    type:      ['', Validators.required],
    teacher:   ['', Validators.required],
    date:      ['', Validators.required],
    examBody:  ['', Validators.required],
  });

  isModifiable$ = combineLatest([this.authService.$currentUser, this.exam$]).pipe(
    map(([user, exam]) => {
      if (!user) return false;
      if (user.role === Role.ADMIN) return true;
      if (user.role === Role.CONTRIBUTOR) {
        if (!exam) return true; // new exam
        return exam.creatorId === user.id && isInCurrentSchoolYear(new Date(exam.date));
      }
      return false;
    })
  );

  ngOnInit(): void {
    this.id = this.resolveId();
    this.subscribeToCurrentUser();

    if (this.id) {
      this.$displayMode.next('show');
      this.service.get(this.id).subscribe({
        next: (exam) => this.onExamLoaded(exam),
        error: () => {
          this.notification.error('Nem sikerült betölteni a nyelvvizsgát!');
          this.router.navigate(['/language-exams']);
        }
      });
    } else {
      this.$displayMode.next('edit');
    }

    this.$displayMode.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(mode => {
      if (mode === 'show') {
        this.form.disable();
      } else {
        this.form.enable();
      }
    });
  }

  private resolveId(): number | null {
    const param = this.route.snapshot.paramMap.get('id');
    return param ? +param : null;
  }

  private subscribeToCurrentUser(): void {
    this.authService.$currentUser.pipe(takeUntilDestroyed(this.destroyRef)).subscribe(user => {
      this.userRole = user?.role || Role.VIEWER;
    });
  }

  private onExamLoaded(exam: LanguageExam): void {
    this.exam$.next(exam);
    this.form.patchValue({
      studentId: exam.studentId,
      language:  exam.language,
      level:     exam.level,
      type:      exam.type,
      teacher:   exam.teacher,
      date:      exam.date,
      examBody:  exam.examBody,
    });
    this.selectedStudents = [{
      id: exam.studentId,
      studentId: exam.studentId,
      firstName: exam.studentFirstName,
      lastName:  exam.studentLastName,
      participations: [],
      fullName: `${exam.studentFirstName} ${exam.studentLastName}`,
      currentClassYear: 0,
      currentClassLetter: '',
    } as StudentSearchResult];
    this.form.disable();
  }

  onStudentSelected(student: StudentSearchResult): void {
    const studentId = (student as any).id ?? student.studentId;
    this.selectedStudents = [student];
    this.form.patchValue({ studentId });
  }

  onStudentRemoved(_student: StudentSearchResult): void {
    this.selectedStudents = [];
    this.form.patchValue({ studentId: null });
  }

  editMode(): void {
    this.$displayMode.next('edit');
  }

  cancelEdit(): void {
    const exam = this.exam$.getValue();
    if (exam) {
      this.onExamLoaded(exam);
    }
    this.$displayMode.next('show');
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    const raw = this.form.getRawValue();
    const data: CreateLanguageExamData = {
      studentId: raw.studentId,
      language:  raw.language,
      level:     raw.level,
      type:      raw.type,
      teacher:   raw.teacher,
      date:      raw.date,
      examBody:  raw.examBody,
    };

    const request$ = this.id
      ? this.service.update(this.id, data)
      : this.service.create(data);

    request$.subscribe({
      next: (exam) => {
        this.notification.success(this.id ? 'A nyelvvizsga sikeresen frissítve!' : 'A nyelvvizsga sikeresen rögzítve!');
        if (!this.id) {
          this.router.navigate(['/language-exams', exam.id]);
        } else {
          this.onExamLoaded(exam);
          this.$displayMode.next('show');
        }
        this.isLoading = false;
      },
      error: (err) => {
        console.error(err);
        this.notification.error('Hiba történt a mentés során.');
        this.isLoading = false;
      }
    });
  }

  deleteExam(): void {
    if (this.id == null) return;
    if (!window.confirm('Biztosan törölni szeretné ezt a nyelvvizsgát?')) return;

    this.service.delete(this.id).subscribe({
      next: () => {
        this.notification.success('A nyelvvizsga sikeresen törölve!');
        this.router.navigate(['/language-exams']);
      },
      error: () => this.notification.error('Hiba történt a törlés során.')
    });
  }
}

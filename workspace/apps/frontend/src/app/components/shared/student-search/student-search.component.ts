import { AfterViewInit, Component, ElementRef, EventEmitter, Input, OnChanges, OnDestroy, OnInit, Output, SimpleChanges, TemplateRef, ViewChild, ViewContainerRef } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { FormControl, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { StudentService } from '@/app/services/student.service';
import { Student, StudentParticipation, StudentSearchResult } from '@/app/models/student.model';
import { debounceTime, distinctUntilChanged, filter, map, Subject, switchMap, takeUntil, tap } from 'rxjs';
import { LoadingSpinnerComponent } from '../loading-spinner/loading-spinner.component';

@Component({
  selector: 'app-student-search',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, LoadingSpinnerComponent, DatePipe, FormsModule],
  templateUrl: './student-search.component.html',
  styleUrls: ['./student-search.component.css']
})
export class StudentSearchComponent implements OnInit, OnDestroy, OnChanges, AfterViewInit {
  @Input() label = 'Diák keresése';
  @Input() placeholder = 'Kezdj el gépelni a diák nevé...';
  @Input() selectedStudents: StudentSearchResult[] = [];
  @Input() disabled = false;
  @Input() defaultClassYear: number = 9; // Default to 9th grade
  @Input() defaultClassLetter: string = 'a'; // Default to 'a' class
  @ViewChild('searchInput') searchInput!: ElementRef<HTMLInputElement>;
  @ViewChild('newStudentTemplate', { static: true }) newStudentTemplate!: TemplateRef<any>;
  @Output() studentSelected = new EventEmitter<StudentSearchResult>();
  @Output() studentRemoved = new EventEmitter<StudentSearchResult>();

  searchControl = new FormControl('');
  searchResults: StudentSearchResult[] = [];
  isLoading = false;
  isDropdownOpen = false;
  private destroy$ = new Subject<void>();

  constructor(private studentService: StudentService) {
    this.searchControl = new FormControl({ value: '', disabled: this.disabled });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['disabled'] && this.searchControl) {
      if (this.disabled) {
        this.searchControl.disable();
      } else {
        this.searchControl.enable();
      }
    }
  }

  ngOnInit(): void {
    this.setupSearch();
  }

  private setupSearch(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged(),
      tap((term: string | null) => {
        if (term && term.length >= 2) {
          this.isLoading = true;
          this.isDropdownOpen = true;
        } else {
          this.searchResults = [];
          this.isDropdownOpen = false;
        }
      }),
      filter((term: string | null): term is string => !!term && term.length >= 2),
      switchMap(term => {
        return this.studentService.searchStudents(term).pipe(
          map(students => ({
            searchTerm: term,
            results: students.map(student => ({
              ...student,
              participations: student.participations || []
            }))
          }))
        );
      }),
      takeUntil(this.destroy$)
    ).subscribe({
      next: ({ searchTerm, results }) => {
        // Always show the new student option at the top
        const newStudentOption = {
          id: undefined,
          firstName: searchTerm?.split(' ')[0] || '',
          lastName: searchTerm?.split(' ').slice(1).join(' ') || '',
          classYear: this.defaultClassYear,
          classLetter: this.defaultClassLetter,
          participations: [],
          isNew: true
        } as unknown as StudentSearchResult;
        
        // Combine the new student option with search results
        this.searchResults = [newStudentOption, ...(results || [])];
        
        this.isLoading = false;
        this.isDropdownOpen = this.searchResults.length > 0;
      },
      error: () => {
        this.isLoading = false;
        this.isDropdownOpen = false;
        this.searchResults = [];
      }
    });
  }

  onSelectStudent(student: StudentSearchResult): void {
    if (!this.isStudentSelected(student)) {
      // Create a new object to avoid reference issues
      const selectedStudent = { ...student };
      
      // Set default values for new students
      if (selectedStudent.isNew) {
        selectedStudent.classYear = selectedStudent.classYear || this.defaultClassYear;
        selectedStudent.classLetter = (selectedStudent.classLetter || this.defaultClassLetter).toLowerCase();
        selectedStudent.name = `${selectedStudent.firstName} ${selectedStudent.lastName}`.trim();
      }
      
      this.studentSelected.emit(selectedStudent);
      this.searchControl.setValue('');
      this.searchResults = [];
      this.isDropdownOpen = false;
    }
  }

  onRemoveStudent(student: StudentSearchResult): void {
    this.studentRemoved.emit(student);
  }

  isStudentSelected(student: StudentSearchResult): boolean {
    // For new students, check by name and class since they don't have an ID yet
    if (student.isNew) {
      return this.selectedStudents.some(s => 
        s.isNew && 
        s.firstName?.toLowerCase() === student.firstName?.toLowerCase() && 
        s.lastName?.toLowerCase() === student.lastName?.toLowerCase() &&
        s.classYear === student.classYear &&
        s.classLetter?.toLowerCase() === student.classLetter?.toLowerCase()
      );
    }
    // For existing students, check by ID
    return this.selectedStudents.some(s => s.id === student.id);
  }

  private dropdownElement: HTMLElement | null = null;

  ngAfterViewInit(): void {
    // Get reference to the dropdown element after view is initialized
    this.dropdownElement = document.querySelector('.student-search-dropdown');
    
    // Handle clicks on the document to close dropdown when clicking outside
    document.addEventListener('click', this.handleDocumentClick.bind(this));
  }

  private handleDocumentClick(event: MouseEvent): void {
    // If click is inside the dropdown, don't close it
    if (this.dropdownElement && this.dropdownElement.contains(event.target as Node)) {
      return;
    }
    
    // If click is on the search input, keep dropdown open if there are results
    const isSearchInput = (event.target as HTMLElement).closest('input[type="text"]') === this.searchInput?.nativeElement;
    
    if (isSearchInput && this.searchResults.length > 0) {
      this.isDropdownOpen = true;
      return;
    }
    
    // Otherwise, close the dropdown
    this.isDropdownOpen = false;
  }

  onFocus(): void {
    if (this.searchResults.length > 0) {
      this.isDropdownOpen = true;
    }
  }

  onInputClick(event: Event): void {
    // Stop propagation to prevent document click handler from closing the dropdown
    event.stopPropagation();
    
    // Toggle dropdown visibility when clicking the input
    if (this.searchResults.length > 0) {
      this.isDropdownOpen = true;
    }
  }
  
  onDropdownClick(event: Event): void {
    // Prevent click from bubbling up to document
    event.stopPropagation();
  }

  trackByStudentId(index: number, student: StudentSearchResult): string | number {
    return student.id || index;
  }

  getMostRecentParticipation(student: StudentSearchResult): StudentParticipation | null {
    if (!student.participations || student.participations.length === 0) {
      return null;
    }
    
    // Sort by competition date in descending order and get the most recent
    return [...student.participations].sort((a, b) => 
      new Date(b.competitionDate).getTime() - new Date(a.competitionDate).getTime()
    )[0];
  }
  
  getMostRecentCompetitionYear(student: StudentSearchResult): string | null {
    const participation = this.getMostRecentParticipation(student);
    return participation?.competitionDate ? new Date(participation.competitionDate).getFullYear().toString() : null;
  }
  
  getStudentTooltip(student: StudentSearchResult): string {
    if (!student.participations || student.participations.length === 0) {
      return 'Nincs korábbi részvétel';
    }
    
    const competitions = student.participations
      .map(p => `${p.competitionName} (${new Date(p.competitionDate).getFullYear()})`)
      .join('\n');
      
    return `Korábbi versenyek:\n${competitions}`;
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

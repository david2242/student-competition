import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { CompetitionParticipant, StudentSearchResult } from '../../models/participant.model';
import { ParticipantService } from '../../services/participant.service';

@Component({
  selector: 'app-participant-editor',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    // Add any other standalone components or directives you might need
  ],
  templateUrl: './participant-editor.component.html',
  styleUrls: ['./participant-editor.component.css'],
  // Provide the service at the component level
  providers: [ParticipantService]
})
export class ParticipantEditorComponent implements OnInit, OnChanges {
  @Input() participants: CompetitionParticipant[] = [];
  @Input() disabled = false;
  @Output() participantsChange = new EventEmitter<CompetitionParticipant[]>();

  private formInitialized = false;

  searchQuery = '';
  searchResults: StudentSearchResult[] = [];
  isSearching = false;
  showAddForm = false;

  participantForm: FormGroup;

  // For demo purposes - replace with actual class options
  readonly CLASS_YEARS = Array.from({ length: 12 }, (_, i) => i + 1);
  readonly CLASS_LETTERS = ['a', 'b', 'c', 'd'];

  constructor(
    private fb: FormBuilder,
    private participantService: ParticipantService
  ) {
    this.participantForm = this.fb.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      classYear: [null, [Validators.required, Validators.min(1), Validators.max(12)]],
      classLetter: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.participantService.participants$.subscribe(participants => {
      this.participants = participants;
      this.participantsChange.emit(participants);
    });
    this.formInitialized = true;
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['participants'] && !changes['participants'].firstChange && this.formInitialized) {
      this.participantService.initialize(this.participants);
    }
  }

  ngOnDestroy(): void {
    // Clean up any subscriptions if needed
  }

  onSearch(query: string): void {
    this.searchQuery = query;
    if (query.length < 2) {
      this.searchResults = [];
      return;
    }

    this.isSearching = true;
    this.participantService.searchStudents(query).subscribe({
      next: (results) => {
        this.searchResults = results;
        this.isSearching = false;
      },
      error: (error) => {
        console.error('Error searching students:', error);
        this.searchResults = [];
        this.isSearching = false;
      }
    });
  }

  onSelectStudent(student: StudentSearchResult): void {
    // Create a new participant from the selected student
    const participant: CompetitionParticipant = {
      studentId: student.studentId,
      firstName: student.firstName,
      lastName: student.lastName,
      classYear: student.currentClassYear,
      classLetter: student.currentClassLetter,
      // Add any other required fields with default values
      id: 0, // Will be set by the backend
      competitionId: 0, // Will be set by the parent
      result: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    // Add the participant directly
    this.participantService.addParticipant(participant);
    
    // Reset search
    this.searchQuery = '';
    this.searchResults = [];
  }

  onAddNew(): void {
    this.participantForm.reset();
    this.showAddForm = true;
  }

  onAddParticipant(): void {
    if (this.participantForm.invalid) {
      this.participantForm.markAllAsTouched();
      return;
    }

    const newParticipant: CompetitionParticipant = {
      ...this.participantForm.value,
      id: 0, // Will be set by the backend
      studentId: 0, // Will be set after creation
      competitionId: 0, // Will be set by the parent
      result: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.participantService.addParticipant(newParticipant);
    this.participantForm.reset();
    this.showAddForm = false;
  }

  onRemoveParticipant(index: number): void {
    this.participantService.removeParticipant(index);
  }

  trackByIndex(index: number): number {
    return index;
  }
}

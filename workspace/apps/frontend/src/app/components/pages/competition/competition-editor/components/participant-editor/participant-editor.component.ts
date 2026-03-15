import { Component, DestroyRef, Input, inject } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CommonModule } from '@angular/common';
import { CompetitionParticipant, StudentSearchResult } from '../../models/participant.model';
import { ParticipantService } from '../../services/participant.service';
import { ParticipantSearchComponent } from './components/participant-search/participant-search.component';
import { ParticipantFormComponent } from './components/participant-form/participant-form.component';
import { ParticipantListComponent } from './components/participant-list/participant-list.component';

@Component({
  selector: 'app-participant-editor',
  standalone: true,
  imports: [
    CommonModule,
    ParticipantSearchComponent,
    ParticipantFormComponent,
    ParticipantListComponent
  ],
  templateUrl: './participant-editor.component.html',
  styleUrls: ['./participant-editor.component.css']
})
export class ParticipantEditorComponent {
  @Input() disabled = false;

  participants: CompetitionParticipant[] = [];
  showAddForm = false;
  isSearching = false;
  searchResults: StudentSearchResult[] = [];
  newParticipantData: { firstName?: string; lastName?: string } = {};

  readonly CLASS_YEARS = Array.from({ length: 12 }, (_, i) => i + 1);
  readonly CLASS_LETTERS = ['a', 'b', 'c', 'd'];

  private participantService = inject(ParticipantService);
  private destroyRef = inject(DestroyRef);

  constructor() {
    this.participantService.participants$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(participants => { this.participants = participants; });
  }

  onSearch(query: string): void {
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
    const participant: CompetitionParticipant = {
      studentId: student.id,
      firstName: student.firstName,
      lastName: student.lastName,
      classYear: student.currentClassYear,
      classLetter: student.currentClassLetter,
    };
    this.participantService.addParticipant(participant);
    this.searchResults = [];
  }

  onAddNew(searchQuery: string = ''): void {
    const [lastName, ...firstNameParts] = searchQuery.trim().split(' ');
    const firstName = firstNameParts.join(' ');

    this.newParticipantData = {
      firstName: firstName || '',
      lastName: lastName || ''
    };

    this.showAddForm = true;
  }

  onAddParticipant(participant: CompetitionParticipant): void {
    if (participant.firstName && participant.lastName) {
      this.participantService.addParticipant(participant);
      this.showAddForm = false;
      this.newParticipantData = {};
    }
  }

  onRemoveParticipant(index: number): void {
    this.participantService.removeParticipant(index);
  }

  onCancelAdd(): void {
    this.showAddForm = false;
    this.newParticipantData = {};
  }

  onFormInteraction(): void {
    this.searchResults = [];
  }

  trackByIndex(index: number): number {
    return index;
  }
}

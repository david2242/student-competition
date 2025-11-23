import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StudentSearchResult } from "@/app/components/pages/competition/competition-editor";

@Component({
  selector: 'app-participant-search',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="search-container mb-3">
      <label for="participantSearch" class="form-label">Keresés létező diákok között</label>
      <div class="input-group">
        <input
          type="text"
          id="participantSearch"
          class="form-control"
          [(ngModel)]="searchQuery"
          (ngModelChange)="onSearchChange($event)"
          placeholder="Keresés név szerint..."
        >
        <button class="btn btn-outline-secondary" type="button" (click)="onAddNewClick()">
          Új diák hozzáadása
        </button>
      </div>

      @if (isSearching) {
        <div class="search-loading mt-2">
          <div class="spinner-border spinner-border-sm" role="status">
            <span class="visually-hidden">Keresés...</span>
          </div>
          Keresés folyamatban...
        </div>
      }

      @if (searchResults.length > 0) {
        <div class="search-results mt-2">
          <div class="list-group">
            @for (student of searchResults; track student.id) {
              <button
                type="button"
                class="list-group-item list-group-item-action"
                (click)="onSelectStudent(student)"
              >
                <div class="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>{{ student.fullName }}</strong>
                    <span class="ms-2 text-muted">
                      {{ student.currentClassYear }}. {{ student.currentClassLetter }}
                    </span>
                  </div>
                  <span class="badge bg-primary rounded-pill">
                    {{ student.participations.length }} verseny
                  </span>
                </div>
                @if (student.participations.length > 0) {
                  <div class="mt-1 small text-muted">
                    Utoljára: {{ student.participations[0].competitionName }}
                    ({{ student.participations[0].competitionDate | date: 'yyyy. MM. dd.' }})
                  </div>
                }
              </button>
            }
          </div>
        </div>
      }
    </div>
  `,
  styles: [`
    .search-container {
      position: relative;
    }
    .search-results {
      max-height: 300px;
      overflow-y: auto;
      border: 1px solid #dee2e6;
      border-radius: 0.25rem;
    }
  `]
})
export class ParticipantSearchComponent {
  @Input() isSearching: boolean = false;
  @Input() searchResults: StudentSearchResult[] = [];
  @Output() search = new EventEmitter<string>();
  @Output() selectStudent = new EventEmitter<StudentSearchResult>();
  @Output() addNew = new EventEmitter<void>();

  searchQuery = '';

  onSearchChange(query: string): void {
    this.search.emit(query);
  }

  onSelectStudent(student: StudentSearchResult): void {
    this.selectStudent.emit(student);
    this.searchQuery = '';
  }

  onAddNewClick(): void {
    this.addNew.emit();
  }
}

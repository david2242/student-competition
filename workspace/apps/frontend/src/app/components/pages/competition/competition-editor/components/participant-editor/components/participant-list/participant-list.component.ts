import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CompetitionParticipant } from "@/app/components/pages/competition/competition-editor";

@Component({
  selector: 'app-participant-list',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="participants-list">
      @if (participants.length === 0) {
        <div class="alert alert-info">
          Még nincsenek résztvevők a versenyen.
        </div>
      } @else {
        <div class="list-group">
          @for (participant of participants; track trackByIndex($index); let i = $index) {
            <div class="list-group-item d-flex justify-content-between align-items-center">
              <div>
                <strong>{{ participant.lastName }} {{ participant.firstName }}</strong>
                <span class="ms-2 text-muted">
                  {{ participant.classYear }}. {{ participant.classLetter }}
                </span>
                @if (participant.studentId) {
                  <span class="badge bg-success ms-2">Létező diák</span>
                } @else {
                  <span class="badge bg-warning text-dark ms-2">Új diák</span>
                }
              </div>
              @if (!disabled) {
                <button
                  class="btn btn-sm btn-outline-danger"
                  (click)="remove.emit(i)"
                  type="button"
                >
                  Törlés
                </button>
              }
            </div>
          }
        </div>
      }
    </div>
  `
})
export class ParticipantListComponent {
  @Input() participants: CompetitionParticipant[] = [];
  @Input() disabled: boolean = false;
  @Output() remove = new EventEmitter<number>();

  trackByIndex(index: number): number {
    return index;
  }
}

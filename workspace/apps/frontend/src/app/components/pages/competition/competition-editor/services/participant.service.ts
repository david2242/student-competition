import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { CompetitionParticipant, StudentSearchResult } from '../models/participant.model';
import { ServerResponse } from "@/app/models/server-response";
import { environment } from "@/environments/environment";
import { catchError, map } from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class ParticipantService {
  private participants = new BehaviorSubject<CompetitionParticipant[]>([]);
  participants$ = this.participants.asObservable();

  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  /**
   * Search for students by name or class
   */
  searchStudents(query: string, filters?: any): Observable<StudentSearchResult[]> {
      return this.http.get<ServerResponse<{ results: StudentSearchResult[], totalCount: number }>>(
        `${this.apiUrl}/students/search`,
        { params: { query, ...filters } }
      ).pipe(
        map(response => response.data?.results || []),
        catchError(error => {
          console.error('Error searching students', error);
          return [];
        })
      );
    }

  /**
   * Initialize with existing competition participants
   */
  initialize(participants: CompetitionParticipant[]): void {
    this.participants.next([...participants]);
  }

  /**
   * Add a new or existing participant
   */
  addParticipant(participant: CompetitionParticipant): void {
    const current = this.participants.value;
    // Check if participant already exists
    const exists = current.some(p =>
      p.studentId ? p.studentId === participant.studentId :
      p.firstName === participant.firstName && p.lastName === participant.lastName
    );

    if (!exists) {
      this.participants.next([...current, { ...participant }]);
    }
  }

  /**
   * Remove participant by index
   */
  removeParticipant(index: number): void {
    const current = this.participants.value;
    if (index >= 0 && index < current.length) {
      const updated = [...current];
      updated.splice(index, 1);
      this.participants.next(updated);
    }
  }

  /**
   * Clear all participants
   */
  clearParticipants(): void {
    this.participants.next([]);
  }

  /**
   * Get participants in the format expected by the API
   */
  getParticipantsForSubmission() {
    return this.participants.value.map(p => {
      if (p.studentId) {
        // Existing student
        return {
          studentId: p.studentId,
          classYear: p.classYear,
          classLetter: p.classLetter,
        };
      } else {
        // New participant
        return {
          firstName: p.firstName,
          lastName: p.lastName,
          classYear: p.classYear,
          classLetter: p.classLetter,
        };
      }
    });
  }

}

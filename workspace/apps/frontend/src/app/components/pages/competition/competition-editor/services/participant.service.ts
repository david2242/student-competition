import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { CompetitionParticipant, StudentSearchResult } from '../models/participant.model';

@Injectable({
  providedIn: 'root'
})
export class ParticipantService {
  private participants = new BehaviorSubject<CompetitionParticipant[]>([]);
  participants$ = this.participants.asObservable();
  
  constructor(private http: HttpClient) {}
  
  /**
   * Search for students by name or class
   */
  searchStudents(query: string): Observable<StudentSearchResult[]> {
    // TODO: Replace with actual API call
    // Example: return this.http.get<StudentSearchResult[]>(`/api/students/search?q=${encodeURIComponent(query)}`);
    return of([
      {
        studentId: 1,
        firstName: 'John',
        lastName: 'Doe',
        fullName: 'John Doe',
        currentClassYear: 10,
        currentClassLetter: 'a',
        participations: []
      },
      {
        studentId: 2,
        firstName: 'Jane',
        lastName: 'Smith',
        fullName: 'Jane Smith',
        currentClassYear: 11,
        currentClassLetter: 'b',
        participations: []
      }
    ]);
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
          result: p.result
        };
      } else {
        // New participant
        return {
          firstName: p.firstName,
          lastName: p.lastName,
          classYear: p.classYear,
          classLetter: p.classLetter,
          result: p.result
        };
      }
    });
  }
}

import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';

import { CompetitionParticipant, StudentSearchResult, isExistingStudent } from '../models/participant.model';
import { ExistingParticipant, NewParticipant } from '@/app/models/student.model';
import { ServerResponse } from '@/app/models/server-response';
import { environment } from '@/environments/environment';

@Injectable()
export class ParticipantService {
  private participants = new BehaviorSubject<CompetitionParticipant[]>([]);
  participants$ = this.participants.asObservable();

  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  searchStudents(query: string): Observable<StudentSearchResult[]> {
    return this.http.get<ServerResponse<{ results: StudentSearchResult[], totalCount: number }>>(
      `${this.apiUrl}/students/search`,
      { params: { query } }
    ).pipe(
      map(response => response.data?.results ?? [])
    );
  }

  initialize(participants: CompetitionParticipant[]): void {
    this.participants.next([...participants]);
  }

  addParticipant(participant: CompetitionParticipant): void {
    if (!this.isAlreadyAdded(participant)) {
      this.participants.next([...this.participants.value, { ...participant }]);
    }
  }

  removeParticipant(index: number): void {
    this.participants.next(
      this.participants.value.filter((_, i) => i !== index)
    );
  }

  clearParticipants(): void {
    this.participants.next([]);
  }

  getParticipantsForSubmission(): Array<ExistingParticipant | NewParticipant> {
    return this.participants.value.map(p => this.toSubmissionPayload(p));
  }

  private isAlreadyAdded(participant: CompetitionParticipant): boolean {
    return this.participants.value.some(p =>
      isExistingStudent(p)
        ? p.studentId === participant.studentId
        : p.firstName === participant.firstName && p.lastName === participant.lastName
    );
  }

  private toSubmissionPayload(p: CompetitionParticipant): ExistingParticipant | NewParticipant {
    if (isExistingStudent(p)) {
      return { studentId: p.studentId, classYear: p.classYear, classLetter: p.classLetter };
    }
    return { firstName: p.firstName, lastName: p.lastName, classYear: p.classYear, classLetter: p.classLetter };
  }
}

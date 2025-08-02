import { inject, Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Competition, Level, Round, Form, Result } from "@/app/models/competition.model";
import { handleBackendResponse, ServerResponse } from "@/app/models/server-response";
import { NewParticipant, ExistingParticipant, Student } from "@/app/models/student.model";
import { environment } from '@/environments/environment';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';

// Type for creating a new competition
export interface CreateCompetitionData extends Omit<Competition, 'id' | 'created' | 'creatorId' | 'participants'> {
  participants: Array<ExistingParticipant | NewParticipant>;
}


@Injectable({
  providedIn: 'root'
})
export class CompetitionService {
  apiUrl = environment.apiUrl;
  private httpClient = inject(HttpClient);

  getCompetitions() {
    return this.httpClient.get<ServerResponse<Competition[]>>(`${this.apiUrl}/competition`).pipe(
      handleBackendResponse()
    );
  }

  getCompetition(id: number) {
    return this.httpClient.get<ServerResponse<Competition>>(`${this.apiUrl}/competition/${id}`).pipe(
      handleBackendResponse()
    );
  }

  createCompetition(competitionData: CreateCompetitionData): Observable<Competition[]> {
    return this.httpClient.post<ServerResponse<Competition[]>>(
      `${this.apiUrl}/competition`,
      competitionData,
    ).pipe(handleBackendResponse())
  }

  updateCompetition(id: number, competitionData: any) {
    if (!id) {
      return throwError(() => new Error('Competition ID is required'));
    }

    return this.httpClient.put<ServerResponse<Competition[]>>(
      `${this.apiUrl}/competition/${id}`,
      competitionData,
    ).pipe(handleBackendResponse())
  }

  deleteCompetition(id: number) {
    return this.httpClient.delete<ServerResponse<void>>(
      `${this.apiUrl}/competition/${id}`,
      { withCredentials: true }
    ).pipe(
      handleBackendResponse(),
      map(() => true), // Return true on success
      catchError((error: any) => {
        console.error('Error deleting competition:', error);
        return of(false);
      })
    );
  }
}

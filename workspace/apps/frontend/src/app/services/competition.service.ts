import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Competition, Form, Result } from "@/app/models/competition.model";
import { handleBackendResponse, ServerResponse } from "@/app/models/server-response";
import { NewParticipant, ExistingParticipant, Student } from "@/app/models/student.model";
import { environment } from '@/environments/environment';
import { catchError, map, switchMap, tap } from 'rxjs/operators';
import { Observable, of, throwError } from 'rxjs';

export interface CompetitionSearchParams {
  name?: string;
  subject?: string;
  teacher?: string;
  level?: string;
  round?: string;
  dateFrom?: string;
  dateTo?: string;
  studentName?: string;
  nextRound?: boolean;
  hasResult?: boolean;
  isOktv?: boolean;
}

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

  searchCompetitions(params: CompetitionSearchParams) {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return this.httpClient.get<ServerResponse<Competition[]>>(`${this.apiUrl}/competition/search`, { params: httpParams }).pipe(
      handleBackendResponse<Competition[]>()
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

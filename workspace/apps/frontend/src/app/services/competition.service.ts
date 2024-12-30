import { inject, Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { Competition } from "@/app/models/competition.model";
import { handleBackendResponse, ServerResponse } from "@/app/models/server-response";
import { environment } from '@/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CompetitionService {

  apiUrl = environment.apiUrl;
  httpService = inject(HttpClient);

  getCompetitions() {
    return this.httpService.get<ServerResponse<Competition[]>>(`${this.apiUrl}/competition`).pipe(handleBackendResponse());
  }

  getCompetition(id: number) {
    return this.httpService.get<ServerResponse<Competition>>(`${this.apiUrl}/competition/${id}`).pipe(handleBackendResponse());
  }

  createCompetition(competition: Competition) {
    return this.httpService.post<ServerResponse<Competition>>(`${this.apiUrl}/competition`, competition).pipe(handleBackendResponse());
  }

  updateCompetition(id: number, competition: Competition) {
    return this.httpService.put<ServerResponse<Competition>>(`${this.apiUrl}/competition/${id}`, competition).pipe(handleBackendResponse());
  }

  deleteCompetition(id: number) {
    return this.httpService.delete<ServerResponse<Competition[]>>(`${this.apiUrl}/competition/${id}`).pipe(handleBackendResponse());
  }
}

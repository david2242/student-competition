import {inject, Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {Competition} from "@/app/models/competition.model";
import {ServerResponse} from "@/app/models/server-response";
import {environment} from '@/environments/environment';

@Injectable({
  providedIn: 'root'
})
export class CompetitionService {

  apiUrl = `${environment.apiUrl}/api`
  httpService = inject(HttpClient)

  getCompetitions() {
    return this.httpService.get<ServerResponse<Competition[]>>(`${this.apiUrl}/competition`);
  }

  getCompetition(id: number) {
    return this.httpService.get<ServerResponse<Competition>>(`${this.apiUrl}/competition/${id}`);
  }

  createCompetition(competition: Competition) {
    return this.httpService.post<ServerResponse<Competition>>(`${this.apiUrl}/competition`, competition);
  }

  updateCompetition(id: number, competition: Competition) {
    return this.httpService.put<ServerResponse<Competition>>(`${this.apiUrl}/competition/${id}`, competition);
  }

  deleteCompetition(id: number) {
    return this.httpService.delete<ServerResponse<Competition[]>>(`${this.apiUrl}/competition/${id}`);
  }
}

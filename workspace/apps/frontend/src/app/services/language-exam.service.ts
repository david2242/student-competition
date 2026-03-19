import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { LanguageExam } from '@/app/models/language-exam.model';
import { handleBackendResponse, ServerResponse } from '@/app/models/server-response';
import { environment } from '@/environments/environment';

export interface LanguageExamSearchParams {
  studentId?: number;
  studentName?: string;
  language?: string;
  level?: string;
  type?: string;
  teacher?: string;
  examBody?: string;
  dateFrom?: string;
  dateTo?: string;
  schoolYear?: string;
}

export interface CreateLanguageExamData {
  studentId: number;
  language: string;
  level: string;
  type: string;
  teacher: string;
  date: string;
  examBody: string;
}

@Injectable({
  providedIn: 'root'
})
export class LanguageExamService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);

  getAll() {
    return this.http.get<ServerResponse<LanguageExam[]>>(`${this.apiUrl}/language-exams`).pipe(
      handleBackendResponse<LanguageExam[]>()
    );
  }

  search(params: LanguageExamSearchParams) {
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, value]) => {
      if (value !== null && value !== undefined && value !== '') {
        httpParams = httpParams.set(key, String(value));
      }
    });
    return this.http.get<ServerResponse<LanguageExam[]>>(`${this.apiUrl}/language-exams/search`, { params: httpParams }).pipe(
      handleBackendResponse<LanguageExam[]>()
    );
  }

  get(id: number) {
    return this.http.get<ServerResponse<LanguageExam>>(`${this.apiUrl}/language-exams/${id}`).pipe(
      handleBackendResponse<LanguageExam>()
    );
  }

  create(data: CreateLanguageExamData) {
    return this.http.post<ServerResponse<LanguageExam>>(`${this.apiUrl}/language-exams`, data).pipe(
      handleBackendResponse<LanguageExam>()
    );
  }

  update(id: number, data: CreateLanguageExamData) {
    return this.http.put<ServerResponse<LanguageExam>>(`${this.apiUrl}/language-exams/${id}`, data).pipe(
      handleBackendResponse<LanguageExam>()
    );
  }

  delete(id: number) {
    return this.http.delete<ServerResponse<boolean>>(`${this.apiUrl}/language-exams/${id}`).pipe(
      handleBackendResponse<boolean>()
    );
  }
}

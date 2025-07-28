import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { StudentSearchResult } from "@/app/models/student.model";
import { environment } from '@/environments/environment';
import { handleBackendResponse, ServerResponse } from "@/app/models/server-response";

@Injectable({
  providedIn: 'root'
})
export class StudentService {
  private apiUrl = environment.apiUrl;
  private http = inject(HttpClient);
  
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
}

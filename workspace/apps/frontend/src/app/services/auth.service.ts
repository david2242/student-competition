import { inject, Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from "@/environments/environment";
import { ILoginRequest } from "@/app/services/auth.types";
import { BehaviorSubject, catchError, of, tap } from "rxjs";
import { CurrentUser } from "@/app/models/current-user";
import { ServerResponse, handleBackendResponse } from "@/app/models/server-response";

// Replaced with ServerResponse<T>

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  apiUrl = `${environment.apiUrl}/auth`;
  httpService = inject(HttpClient);
  $isLoggedIn = new BehaviorSubject(false);
  $currentUser = new BehaviorSubject<CurrentUser | null>(null);

  login(credentials: ILoginRequest) {
    return this.httpService.post<ServerResponse<CurrentUser>>(
      `${this.apiUrl}/login`,
      { ...credentials, rememberMe: true }
    ).pipe(
      handleBackendResponse<CurrentUser>(),
      tap({
        next: (user) => {
          this.$isLoggedIn.next(true);
          this.$currentUser.next(user);
        },
        error: (error) => {
          this.$isLoggedIn.next(false);
          this.$currentUser.next(null);
          throw error;
        }
      })
    );
  }

  logout() {
    this.$isLoggedIn.next(false);
    this.$currentUser.next(null);

    return this.httpService.post(`${this.apiUrl}/logout`, null, {
      responseType: 'text'
    }).pipe(
      catchError(() => of(null))
    );
  }

  hasRole(role: string | string[]): boolean {
    const currentUser = this.$currentUser.value;
    if (!currentUser) return false;

    const rolesToCheck = Array.isArray(role) ? role : [ role ];
    return rolesToCheck.includes(currentUser.role);
  }

  info() {
    return this.httpService.get<ServerResponse<CurrentUser>>(`${this.apiUrl}/me`).pipe(
      handleBackendResponse<CurrentUser>(),
      tap({
        next: (user) => {
          this.$isLoggedIn.next(true);
          this.$currentUser.next(user);
        },
        error: () => {
          this.$isLoggedIn.next(false);
          this.$currentUser.next(null);
        }
      })
    );
  }
}

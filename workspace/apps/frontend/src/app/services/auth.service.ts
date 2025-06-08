import { inject, Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from "@/environments/environment";
import { ILoginRequest } from "@/app/services/auth.types";
import { BehaviorSubject, tap, switchMap, catchError, throwError, of } from "rxjs";
import { CurrentUser } from "@/app/models/current-user";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  apiUrl = `${environment.apiUrl}`;
  httpService = inject(HttpClient);
  $isLoggedIn = new BehaviorSubject(false);
  $currentUser = new BehaviorSubject<CurrentUser | null>(null);

  login(credentials: ILoginRequest) {
    return this.httpService.post(`${this.apiUrl}/login`, credentials, {
      params: {
        useCookies: true,
        useSessionCookies: true
      },
      responseType: 'text'  // Since we don't expect a response body
    }).pipe(
      switchMap(() => this.info()),
      catchError(() => {
        this.logout().subscribe();
        return throwError(() => new Error('Login failed: Could not retrieve user information'));
      })
    );
  }

  info() {
    return this.httpService.get<CurrentUser>(`${this.apiUrl}/user/me`).pipe(
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

  logout() {
    this.$isLoggedIn.next(false);
    this.$currentUser.next(null);

    return this.httpService.post(`${this.apiUrl}/logout`, null, {
      responseType: 'text'
    }).pipe(
      catchError(() => of(null))
    );
  }
}

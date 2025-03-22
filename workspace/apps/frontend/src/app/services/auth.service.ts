import { inject, Injectable } from '@angular/core';
import { HttpClient } from "@angular/common/http";
import { environment } from "@/environments/environment";
import { ILoginRequest } from "@/app/services/auth.types";
import { BehaviorSubject, tap } from "rxjs";

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  apiUrl = `${environment.apiUrl}`;
  httpService = inject(HttpClient);
  $isLoggedIn = new BehaviorSubject(false);

  login(credentials: ILoginRequest) {
    return this.httpService.post<ILoginRequest>(`${this.apiUrl}/login`, credentials, {params: {useCookies: true, useSessionCookies: true}}).pipe(tap(() => this.$isLoggedIn.next(true)));
  }

  info() {
    return this.httpService.get(`${this.apiUrl}/manage/info`).pipe(tap(() => this.$isLoggedIn.next(true)));
  }

  logout() {
    return this.httpService.post(`${this.apiUrl}/logout`, null).pipe(tap(() => {
      this.$isLoggedIn.next(false)
    }));

  }
}

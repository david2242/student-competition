import {
  HttpErrorResponse,
  HttpEvent,
  HttpHandlerFn,
  HttpRequest,
} from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { inject } from "@angular/core";
import { AuthService } from "@/app/services/auth.service";
import { Router } from "@angular/router";
import { catchError } from "rxjs/operators";

export function unauthorizedInterceptor(req: HttpRequest<unknown>, next: HttpHandlerFn): Observable<HttpEvent<unknown>> {
  const authService = inject(AuthService);
  const router = inject(Router);
  return next(req).pipe(catchError((error: HttpErrorResponse) => {
    if (error.status === 401) {
      authService.$isLoggedIn.next(false);
      router.navigate([ 'login' ]);
      return throwError(() => 'Unauthorized');
    }
    ;
    return throwError(() => error);
  }));
}

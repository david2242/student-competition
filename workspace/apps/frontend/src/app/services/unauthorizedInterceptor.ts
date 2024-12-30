import {
  HttpEvent,
  HttpEventType,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from "@angular/common/http";
import { Observable, tap } from "rxjs";
import { Injectable } from "@angular/core";
import { AuthService } from "@/app/services/auth.service";

@Injectable()
export class UnauthorizedInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) {
  }

  intercept(req: HttpRequest<any>, handler: HttpHandler): Observable<HttpEvent<any>> {
    return handler.handle(req).pipe(tap(event => {
      if (event.type === HttpEventType.Response && event.status === 401) {
        this.authService.$isLoggedIn.next(false);
      }
    }));
  }
}

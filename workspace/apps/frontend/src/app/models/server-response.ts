import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";

export interface ServerResponse<T> {
  data: T;
  message: string;
  success: boolean;
}

export function handleBackendResponse<T>() {
  return (source: Observable<ServerResponse<T>>): Observable<T> =>
    source.pipe(map((response) => {
        if (response.success) {
          return response.data;
        } else {
          throw new Error(response.message);
        }
      }),
      catchError((error) => {
        let message = error.error?.message || error.message || error || 'An error occurred';
        return throwError(() => message);
      }));
}

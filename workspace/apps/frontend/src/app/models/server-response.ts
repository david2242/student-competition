import { Observable, throwError } from "rxjs";
import { catchError, map } from "rxjs/operators";

export interface ServerResponse<T = any> {
  // Standard properties (camelCase for frontend)
  data?: T;
  message?: string;
  success?: boolean;
  errors?: string[] | Record<string, string[]>;
  
  // Backend ServiceResponse properties (PascalCase)
  Data?: T;
  Message?: string;
  Success?: boolean;
  Errors?: string[] | Record<string, string[]>;
}

export function handleBackendResponse<T>() {
  return (source: Observable<ServerResponse<T>>): Observable<T> =>
    source.pipe(
      map((response) => {
        // Check if the response has a 'success' property (direct response)
        // or if it's a ServiceResponse with Data and Success properties
        const isServiceResponse = 'Data' in response || 'Success' in response;
        const success = isServiceResponse ? (response as any).Success : response.success;
        const data = isServiceResponse ? (response as any).Data : response.data;
        const message = isServiceResponse ? (response as any).Message : response.message;
        const errors = isServiceResponse ? (response as any).Errors : response.errors;

        if (success) {
          if (data === undefined) {
            console.warn('API Warning: Response was successful but contained no data', response);
            return {} as T; // Return empty object if no data
          }
          return data;
        } else {
          const errorMessage = message || 
                             (errors && errors.length > 0 
                              ? Array.isArray(errors) ? errors.join('\n') : JSON.stringify(errors)
                              : 'An unknown error occurred');
          console.error('API Error:', errorMessage, 'Response:', response);
          throw new Error(errorMessage);
        }
      }),
      catchError((error) => {
        console.error('API request failed:', {
          name: error.name,
          message: error.message,
          status: error.status,
          error: error.error,
          stack: error.stack
        });
        
        let errorMessage = 'An error occurred while processing your request';
        
        if (error.error) {
          // Handle different error response formats
          if (typeof error.error === 'string') {
            try {
              const parsedError = JSON.parse(error.error);
              errorMessage = parsedError.message || parsedError.Message || errorMessage;
            } catch (e) {
              errorMessage = error.error;
            }
          } else if (error.error.message || error.error.Message) {
            errorMessage = error.error.message || error.error.Message;
          }
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        return throwError(() => new Error(errorMessage));
      })
    );
}

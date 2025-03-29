import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { appRoutes } from './app.routes';
import { provideAnimations } from "@angular/platform-browser/animations";
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { provideRouter } from '@angular/router';
import { provideToastr } from 'ngx-toastr';
import { unauthorizedInterceptor } from "@/app/services/unauthorizedInterceptor";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(withInterceptors([unauthorizedInterceptor])),
    provideAnimations(),
    provideToastr()
  ],
};

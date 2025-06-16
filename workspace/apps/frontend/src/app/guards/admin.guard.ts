import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '@/app/services/auth.service';
import { Role } from '@/app/models/current-user';
import { filter, of, switchMap, take } from "rxjs";
import { map } from "rxjs/operators";

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Start the auth check if we don't have a user yet
  const authCheck$ = authService.$currentUser.value
    ? of(authService.$currentUser.value)
    : authService.info().pipe(switchMap(() => authService.$currentUser));

  return authCheck$.pipe(
    // Take the first emission
    take(1),
    // Check if user has admin role
    map(user => {
      if (user && authService.hasRole(Role.ADMIN)) {
        return true;
      }

      // If not admin or not logged in, redirect to home
      router.navigate(['/']);
      return false;
    })
  );
};

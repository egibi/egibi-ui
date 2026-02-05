import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Wait for session restore (including token refresh) to complete
  await auth.whenInitialized;

  if (auth.isAuthenticated()) {
    return true;
  }

  // Store the attempted URL for redirect after login
  localStorage.setItem('auth_return_url', state.url);
  return router.createUrlTree(['/auth/login']);
};

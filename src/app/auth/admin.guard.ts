import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from './auth.service';

/**
 * Route guard that requires admin role.
 * Redirects to home if authenticated but not admin,
 * or to login if not authenticated.
 */
export const adminGuard: CanActivateFn = async (route, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);

  // Wait for session restore to complete
  await auth.whenInitialized;

  if (!auth.isAuthenticated()) {
    localStorage.setItem('auth_return_url', state.url);
    return router.createUrlTree(['/auth/login']);
  }

  if (!auth.isAdmin()) {
    // Authenticated but not admin — redirect to home
    return router.createUrlTree(['/']);
  }

  return true;
};

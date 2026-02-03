import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AuthService } from './auth.service';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  const apiUrl = 'https://localhost:7182';

  // Only attach tokens to our API (not to external URLs)
  if (req.url.startsWith(apiUrl)) {
    // Skip token for auth endpoints (login, signup, password reset, token exchange)
    const skipTokenPaths = ['/auth/login', '/auth/signup', '/auth/forgot-password', '/auth/reset-password', '/connect/token'];
    const shouldSkip = skipTokenPaths.some(path => req.url.includes(path));

    if (!shouldSkip && auth.accessToken) {
      req = req.clone({
        setHeaders: {
          Authorization: `Bearer ${auth.accessToken}`
        }
      });
    }
  }

  return next(req).pipe(
    catchError((error: HttpErrorResponse) => {
      if (error.status === 401 && auth.isAuthenticated()) {
        // Token expired — try refresh
        auth.refreshAccessToken().then(success => {
          if (!success) {
            auth.logout();
          }
        });
      }
      return throwError(() => error);
    })
  );
};

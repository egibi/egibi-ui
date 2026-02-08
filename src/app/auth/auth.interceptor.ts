import { HttpInterceptorFn, HttpErrorResponse, HttpRequest, HttpHandlerFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, from, switchMap, throwError } from 'rxjs';
import { AuthService } from './auth.service';
import { environment } from '../../environments/environment';

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);

  // FIX #8: Use centralized environment config instead of hardcoded URL
  const apiUrl = environment.apiUrl;

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
        // FIX #12: Token expired — refresh and RETRY the original request
        return from(auth.refreshAccessToken()).pipe(
          switchMap(success => {
            if (success) {
              // Clone the original request with the new access token
              const retryReq = req.clone({
                setHeaders: {
                  Authorization: `Bearer ${auth.accessToken}`
                }
              });
              return next(retryReq);
            } else {
              auth.logout();
              return throwError(() => error);
            }
          }),
          catchError(refreshError => {
            auth.logout();
            return throwError(() => error);
          })
        );
      }
      return throwError(() => error);
    })
  );
};

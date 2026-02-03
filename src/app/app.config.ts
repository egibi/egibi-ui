import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from "@angular/common/http";
import { ReactiveFormsModule } from "@angular/forms";
import { EnvironmentService } from './_services/environment.service';
import { authInterceptor } from './auth/auth.interceptor';

function initializeEnvironment(envService: EnvironmentService) {
  return () => envService.load();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([authInterceptor])
    ),
    ReactiveFormsModule,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeEnvironment,
      deps: [EnvironmentService],
      multi: true
    }
  ],
};

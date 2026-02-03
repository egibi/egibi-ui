import { ApplicationConfig, provideZoneChangeDetection, APP_INITIALIZER } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideHttpClient } from "@angular/common/http";
import { ReactiveFormsModule } from "@angular/forms";
import { EnvironmentService } from './_services/environment.service';

function initializeEnvironment(envService: EnvironmentService) {
  return () => envService.load();
}

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(),
    ReactiveFormsModule,
    {
      provide: APP_INITIALIZER,
      useFactory: initializeEnvironment,
      deps: [EnvironmentService],
      multi: true
    }
  ],
};

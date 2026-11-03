/**
 * Global Angular application configuration.
 *
 * Centralizes runtime providers used across the entire application,
 * including routing, HTTP, animations, and toast notifications.
 */
import { ApplicationConfig, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { provideToastr } from 'ngx-toastr';
import { routes } from './app.routes';

/**
 * Application-wide dependency injection and provider configuration.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimations(),
    provideToastr({
      positionClass: 'toast-bottom-right',
      timeOut: 4000,
      closeButton: false,
      progressBar: true,
      tapToDismiss: true,
      newestOnTop: false,
      preventDuplicates: true,
      enableHtml: true,
      toastClass: 'ngx-toastr'
    }),
    provideHttpClient(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes)
  ]
};

/**
 * Application bootstrap file.
 *
 * Initializes the Angular app and attaches the root component to the browser.
 * This file is the entry point used by the Angular CLI build and dev server.
 */
/// <reference types="@angular/localize" />

import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

bootstrapApplication(AppComponent, appConfig).catch((err) => console.error(err));

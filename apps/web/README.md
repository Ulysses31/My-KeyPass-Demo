# Web Application Documentation

This folder contains the Angular frontend for the KeyPass demo application. It provides the browser-based user interface for viewing, filtering, creating, editing, and deleting records and categories, while communicating with the local JSON API service in the project.

The app is built with Angular 18 and uses standalone components, a route-based UI, and a lightweight service layer for HTTP communication.

## Overview

The web app is responsible for:

- rendering the main application shell with navigation and theme controls
- showing an overview dashboard of categories and records
- browsing and filtering categories
- browsing and filtering rows/records
- opening detail screens for create/update flows
- encrypting and decrypting passwords before copying them to the clipboard
- communicating with the backend API at `http://localhost:4200/api`

## Project structure

The main application files are organized as follows:

```text
apps/web/
├── src/
│   ├── app/
│   │   ├── app.component.ts
│   │   ├── app.component.html
│   │   ├── app.component.scss
│   │   ├── app.config.ts
│   │   ├── app.routes.ts
│   │   ├── features/
│   │   │   ├── categories/
│   │   │   │   ├── browse/
│   │   │   │   ├── load/
│   │   │   │   └── services/
│   │   │   ├── dashboard/
│   │   │   └── rows/
│   │   └── shared/
│   │       ├── dto/
│   │       ├── features/
│   │       ├── hero-icon/
│   │       └── services/
│   ├── main.ts
│   ├── styles.scss
│   └── index.html
├── package.json
└── README.md
```

## Entry points

### Main application bootstrapping

The app starts from the Angular bootstrap process in `src/main.ts`, which configures the application with the app configuration registered in [src/app/app.config.ts](./src/app/app.config.ts).

The global app-level configuration includes:

- Angular routing via `provideRouter(routes)`
- HTTP client support via `provideHttpClient()`
- animations via `provideAnimations()`
- toast notifications via `provideToastr(...)`

### Root application shell

The root component is defined in [src/app/app.component.ts](./src/app/app.component.ts) and rendered by [src/app/app.component.html](./src/app/app.component.html).

This shell includes:

- a left sidebar navigation for Overview, Categories, and Data
- a top header with page title and theme toggle
- a button to create a new entry
- the router outlet where child pages render

The app also supports a light/dark theme that is stored in localStorage with the key `keypass-theme`.

## Routing

The application routes are defined in [src/app/app.routes.ts](./src/app/app.routes.ts).

Routes:

- `/` → redirects to `/overview`
- `/overview` → DashboardComponent
- `/categories` → CategoriesComponent
- `/categories/:id` → CategoriesDetailsComponent
- `/rows` → RowsComponent
- `/rows/:id` → RowsDetailsComponent
- `**` → redirects to `/overview`

This gives the app a simple CRUD-like navigation structure for both categories and data records.

## Feature modules

### Dashboard overview

The dashboard is implemented in [src/app/features/dashboard/dashboard.component.ts](./src/app/features/dashboard/dashboard.component.ts) and [src/app/features/dashboard/dashboard.component.html](./src/app/features/dashboard/dashboard.component.html).

The dashboard is the landing page and provides:

- summary cards for total categories and total entries
- a row overview table
- filters for title search and category selection
- category counts and metadata
- password copy interaction

The dashboard loads its data through an HTTP request to the backend API:

```ts
this.httpService
  .get<{ rows: any[]; categories: any[] }>('http://localhost:4200/api/data')
```

It then enriches each row with a resolved category name and prepares filters for the UI.

### Categories management

The categories section uses:

- [src/app/features/categories/browse/categories.component.ts](./src/app/features/categories/browse/categories.component.ts)
- [src/app/features/categories/services/categories.service.ts](./src/app/features/categories/services/categories.service.ts)
- [src/app/features/categories/load/categories.details.component.ts](./src/app/features/categories/load/categories.details.component.ts)

The browse page extends the base browse component and shows a list of categories with filter capabilities. Each category includes a name and a description.

The service class is a thin wrapper over the shared `BaseService` and targets:

```ts
http://localhost:4200/api/categories
```

### Rows / records management

The rows section uses:

- [src/app/features/rows/browse/rows.component.ts](./src/app/features/rows/browse/rows.component.ts)
- [src/app/features/rows/services/rows.service.ts](./src/app/features/rows/services/rows.service.ts)
- [src/app/features/rows/load/rows.details.component.ts](./src/app/features/rows/load/rows.details.component.ts)

Rows are the core data of the vault and include fields such as:

- `RecordID`
- `Title`
- `Username`
- `Password`
- `EncryptedPassword`
- `URL`
- `Notes`
- `CategoryID`
- `Category`

The rows service calls the backend on:

```ts
http://localhost:4200/api/rows
```

The browse UI allows filtering and selection of records by field, while the detail view handles create and edit flows.

## Shared architecture

### DTOs

The app uses typed DTOs in [src/app/shared/dto](./src/app/shared/dto):

- [category-dto.ts](./src/app/shared/dto/category-dto.ts)
- [record-dto.ts](./src/app/shared/dto/record-dto.ts)

They define the structure for category and row data used across the app.

### Base service

The base service is defined in [src/app/shared/services/base.service.ts](./src/app/shared/services/base.service.ts).

It provides common CRUD behavior:

- `getAll()`
- `getById(id)`
- `create(data)`
- `update(id, data)`
- `delete(id)`
- `applyFilter(filterText, field)`

This service centralizes shared HTTP logic and error handling. It also uses Angular signals to track:

- browser list state
- selected item state
- loading state
- error state

### Base browse component

The reusable table/list UI is implemented in [src/app/shared/features/browse/base.browse.ts](./src/app/shared/features/browse/base.browse.ts) and [src/app/shared/features/browse/base.browse.html](./src/app/shared/features/browse/base.browse.html).

It provides a generic list view with:

- dynamic headers
- optional filtering by field
- a refresh action
- details navigation via row selection
- loading and error states

This component is shared by both the categories and rows browse screens.

## Password encryption and clipboard behavior

The app includes a crypto layer in [src/app/shared/services/encrypt.decrypt.ts](./src/app/shared/services/encrypt.decrypt.ts).

It uses the Web Crypto API to:

- derive a key with PBKDF2 using a master password and random salt
- encrypt data using AES-GCM
- store the encrypted payload as JSON containing:
  - `salt`
  - `iv`
  - `ciphertext`
  - `iterations`

This is used in the dashboard when copying a password to the clipboard. A password is decrypted locally in the browser and then sent to the clipboard.

Note: in the dashboard code, `masterPassword` is currently set to a hardcoded value:

```ts
masterPassword = '12345678';
```

This is suitable for a demo or local prototype, but it should be replaced with a real secret-management strategy in production.

## API integration

The frontend relies on the local API service created in the project. It targets the following base URLs:

- `http://localhost:4200/api/data`
- `http://localhost:4200/api/categories`
- `http://localhost:4200/api/rows`

The UI uses REST-style behavior built on top of the local JSON API, which supports:

- `GET /api/data`
- `GET /api/:resource`
- `GET /api/:resource/:id`
- `POST /api/:resource`
- `PUT /api/:resource/:id`
- `PATCH /api/:resource/:id`
- `DELETE /api/:resource/:id`

For more detail on the backend behavior, see [../../api/README.md](../../api/README.md).

## Internationalization (i18n) setup

This project includes Angular i18n support so the UI can be translated and built for multiple locales. The setup is intentionally simple and uses Angular's built-in localization tooling with XLIFF message files.

### 1. Install Angular localization support

The package is already present in the app dependencies, but if you need to add it manually in another Angular project, run:

```bash
npm install @angular/localize
```

This adds the runtime localization package required by Angular for extracted and localized templates.

### 2. Configure the locale in the Angular project

The app's [angular.json](./angular.json) contains the i18n configuration:

```json
"i18n": {
  "sourceLocale": "en-US",
  "locales": {
    "el-GR": "src/locale/messages.el-GR.xlf"
  }
},
"build": {
  "options": {
    "localize": ["el-GR"],
    "polyfills": ["zone.js", "@angular/localize/init"]
  }
}
```

What this means:

- `en-US` is the source/default locale.
- `el-GR` is a secondary locale configured to use the translation file at `src/locale/messages.el-GR.xlf`.
- The `localize` option tells Angular to build the app with that locale enabled.
- `@angular/localize/init` is added to the polyfills so Angular's i18n runtime is loaded correctly in the browser.

### 3. Mark translatable strings

Strings in templates and TypeScript are marked using Angular's `$localize` function and/or Angular's extraction process. Examples in this project include:

```ts
const title = $localize`Overview`;
```

And in templates:

```html
<span i18n>Overview</span>
```

These markers tell Angular which text should be extracted for translation.

### 4. Extract translations

To generate the XLIFF file from the source templates, run:

```bash
cd apps/web
npx ng extract-i18n --output-path src/locale
```

This creates or updates the base translation file, usually `src/locale/messages.xlf`.

The generated file contains every extracted source string, including the location and context where it was found.

### 5. Create locale-specific translation files

The application includes a Greek locale file:

- [src/locale/messages.el-GR.xlf](./src/locale/messages.el-GR.xlf)

You can create additional locale files by duplicating the base file and translating the `<target>` values, or by generating a new locale with a new file path in `angular.json`.

Example pattern:

```json
"locales": {
  "en-US": "src/locale/messages.xlf",
  "el-GR": "src/locale/messages.el-GR.xlf"
}
```

### 6. Build localized versions

A localized build is produced by running:

```bash
cd apps/web
npx ng build --configuration production
```

Because the project has `localize` enabled in the build options, Angular will generate the configured locale output for `el-GR` as part of the build.

You can also force a locale build explicitly:

```bash
npx ng build --localize
```

This command builds all configured locales for the application.

### 7. Serve the app with localized output

For local development, the app is usually served without explicit locale selection, and the source locale is used by default. When deployed for a specific language, you normally build the app for that locale and serve the generated output directory.

### Why this setup matters

This configuration is useful because it:

- keeps strings out of hard-coded code for translation
- enables automatic extraction of translatable text
- supports multiple locale builds without changing application logic
- keeps translations in standard XLIFF format, which is compatible with translation tools and localization workflows

### Important note

The project is currently configured as a demo/localized prototype. In a production application, you would typically:

- store translation files in a dedicated locale management workflow
- validate translation quality before release
- add locale fallback rules for missing translations
- handle RTL or locale-specific formatting with additional Angular date/number settings

## UI and styling

The front-end styling uses a mix of:

- Angular component-level styles
- Tailwind-inspired utility classes in templates
- dark mode theme classes using the `dark` root class

The main layout uses a modern dashboard shell with:

- a sidebar navigation
- white/dark cards
- rounded panels
- subtle shadows
- light grid-based layout

## Scripts and development commands

The app package scripts are defined in [package.json](./package.json):

```json
{
  "scripts": {
    "ng": "ng",
    "start": "ng serve --host 0.0.0.0 --port 4200",
    "build": "ng build",
    "watch": "ng build --watch --configuration development",
    "test": "ng test"
  }
}
```

### Run locally

From the project root:

```bash
cd apps/web
npm install
npm start
```

The app is served at:

```text
http://localhost:4200
```

### Production build

```bash
cd apps/web
npm run build
```

### Run tests

```bash
cd apps/web
npm test
```

## Notes for developers

- The app is currently configured for a local mock-data workflow rather than a full production backend.
- The API is expected to run locally before the web app is used.
- Most browser-side interactions are based on Angular Signals and reactive patterns.
- The UI is designed primarily for internal proof-of-concept and demo usage.

## Summary

The `apps/web` application is a complete Angular-based client for the KeyPass demo. It provides the front-end dashboard, list/detail screens, filtering, dark mode, and password-management interactions while relying on a small JSON-backed REST API for persistence.

It is best understood as a local, browser-first password vault prototype with a modern dashboard layout and a simple CRUD data model.

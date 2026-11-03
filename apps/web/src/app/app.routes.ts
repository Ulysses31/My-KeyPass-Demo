/**
 * Application route configuration.
 *
 * Defines the navigable screens for the vault dashboard and its record/category flows.
 */
import { Routes } from '@angular/router';
import { CategoriesComponent } from './features/categories/browse/categories.component';
import { CategoriesDetailsComponent } from './features/categories/load/categories.details.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { RowsComponent } from './features/rows/browse/rows.component';
import {
  RowsDetailsComponent
} from './features/rows/load/rows.details.component';

/**
 * Route table used by the Angular router.
 */
export const routes: Routes = [
  { path: '', redirectTo: 'overview', pathMatch: 'full' },
  { path: 'overview', component: DashboardComponent },
  { path: 'categories', component: CategoriesComponent },
  { path: 'categories/:id', component: CategoriesDetailsComponent },
  { path: 'rows', component: RowsComponent },
  { path: 'rows/:id', component: RowsDetailsComponent },
  { path: '**', redirectTo: 'overview' }
];

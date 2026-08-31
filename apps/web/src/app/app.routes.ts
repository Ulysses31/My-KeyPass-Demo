import { Routes } from '@angular/router';
import { CategoriesComponent } from './features/categories/browse/categories.component';
import { CategoriesDetailsComponent } from './features/categories/load/categories.details.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { DataComponent } from './features/data/browse/data.component';
import { DataDetailsComponent } from './features/data/load/data.details.component';

export const routes: Routes = [
  { path: '', redirectTo: 'overview', pathMatch: 'full' },
  { path: 'overview', component: DashboardComponent },
  { path: 'categories', component: CategoriesComponent },
  { path: 'categories/:id', component: CategoriesDetailsComponent },
  { path: 'data', component: DataComponent },
  { path: 'data/:id', component: DataDetailsComponent },
  { path: '**', redirectTo: 'overview' }
];

import { Routes } from '@angular/router';
import { CategoriesNewComponent } from './features/categories/browse/categoriesNew.component';
import { CategoriesDetailsComponent } from './features/categories/load/categories.details.component';
import { DashboardComponent } from './features/dashboard/dashboard.component';
import { RowsComponent } from './features/rows/browse/rows.component';
import { RowsDetailsComponent } from './features/rows/load/rows.details.component';

export const routes: Routes = [
  { path: '', redirectTo: 'overview', pathMatch: 'full' },
  { path: 'overview', component: DashboardComponent },
  // { path: 'categories', component: CategoriesComponent },
  { path: 'categories', component: CategoriesNewComponent },
  { path: 'categories/:id', component: CategoriesDetailsComponent },
  { path: 'rows', component: RowsComponent },
  { path: 'rows/:id', component: RowsDetailsComponent },
  { path: '**', redirectTo: 'overview' }
];

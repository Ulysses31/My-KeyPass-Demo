import { Routes } from "@angular/router";
import { CategoriesComponent } from "./features/categories/categories.component";
import { DashboardComponent } from "./features/dashboard/dashboard.component";
import { DataComponent } from "./features/data/data.component";

export const routes: Routes = [
  { path: "", redirectTo: "overview", pathMatch: "full" },
  { path: "overview", component: DashboardComponent },
  { path: "categories", component: CategoriesComponent },
  { path: "data", component: DataComponent },
  { path: "**", redirectTo: "overview" },
];

import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, EMPTY, finalize, tap } from 'rxjs';
import { CategoryDto } from '../../../shared/dto/category-dto';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule],
  providers: [],
  templateUrl: './categories.component.html'
})
export class CategoriesComponent implements OnInit {
  httpService: HttpClient = inject(HttpClient);
  router: Router = inject(Router);
  route: ActivatedRoute = inject(ActivatedRoute);
  destroyRef: DestroyRef = inject(DestroyRef);

  categories: CategoryDto[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.successMessage =
          params.get('deleted') === '1' ? 'Category deleted successfully.' : '';
      });

    this.getCategories();
  }

  private getCategories(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.httpService
      .get<CategoryDto[]>('http://localhost:4200/api/categories')
      .pipe(
        tap((response: CategoryDto[]) => {
          this.categories = response;
        }),
        catchError(() => {
          this.categories = [];
          this.errorMessage = 'Unable to load categories.';
          return EMPTY;
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe();
  }

  getSelected(id: number): void {
    this.router.navigate(['/categories', id]);
  }
}

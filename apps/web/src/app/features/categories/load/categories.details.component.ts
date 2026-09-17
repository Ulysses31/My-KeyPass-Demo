import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, EMPTY, finalize, switchMap, tap } from 'rxjs';
import { CategoryDto } from '../../../shared/dto/category-dto';

@Component({
  selector: 'app-categories-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  providers: [],
  templateUrl: './categories.details.component.html'
})
export class CategoriesDetailsComponent implements OnInit {
  httpService: HttpClient = inject(HttpClient);
  actRouter: ActivatedRoute = inject(ActivatedRoute);
  router: Router = inject(Router);
  destroyRef: DestroyRef = inject(DestroyRef);

  category: CategoryDto | null = null;
  isLoading = true;
  isSaving = false;
  isDeleting = false;
  errorMessage = '';
  successMessage = '';

  categoryForm = new FormGroup({
    CategoryID: new FormControl({ value: '', disabled: true }, { nonNullable: true }),
    Name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2), Validators.maxLength(60)]
    }),
    Description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(250)]
    }),
    NameWithBadge: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(80)]
    })
  });

  ngOnInit(): void {
    this.actRouter.params
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((params) => {
          const id = String(params['id'] ?? '');

          if (!id || Number(id) <= 0) {
            this.errorMessage = 'Invalid category id.';
            this.isLoading = false;
            return EMPTY;
          }

          this.errorMessage = '';
          this.successMessage = '';
          this.isLoading = true;

          return this.httpService
            .get<CategoryDto>(`http://localhost:4200/api/categories/${id}`)
            .pipe(
              tap((response) => {
                this.category = response;
                this.categoryForm.reset(
                  {
                    CategoryID: String(response.CategoryID ?? ''),
                    Name: response.Name ?? '',
                    Description: response.Description ?? '',
                    NameWithBadge: response.NameWithBadge ?? ''
                  },
                  { emitEvent: false }
                );
                this.categoryForm.markAsPristine();
              }),
              catchError(() => {
                this.category = null;
                this.errorMessage = 'Unable to load category details.';
                return EMPTY;
              }),
              finalize(() => {
                this.isLoading = false;
              })
            );
        })
      )
      .subscribe();
  }

  onSubmit(): void {
    if (!this.category) {
      return;
    }

    if (this.categoryForm.invalid) {
      this.categoryForm.markAllAsTouched();
      return;
    }

    const categoryId = String(this.category.CategoryID);
    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.httpService
      .patch<CategoryDto>(`http://localhost:4200/api/categories/${categoryId}`, {
        Name: this.categoryForm.controls.Name.value.trim(),
        Description: this.categoryForm.controls.Description.value.trim(),
        NameWithBadge: this.categoryForm.controls.NameWithBadge.value.trim()
      })
      .pipe(
        tap((updatedCategory) => {
          this.category = updatedCategory;
          this.categoryForm.reset(
            {
              CategoryID: String(updatedCategory.CategoryID ?? ''),
              Name: updatedCategory.Name ?? '',
              Description: updatedCategory.Description ?? '',
              NameWithBadge: updatedCategory.NameWithBadge ?? ''
            },
            { emitEvent: false }
          );
          this.categoryForm.markAsPristine();
          this.successMessage = 'Category updated successfully.';
        }),
        catchError(() => {
          this.errorMessage = 'Unable to update category.';
          return EMPTY;
        }),
        finalize(() => {
          this.isSaving = false;
        })
      )
      .subscribe();
  }

  onDelete(): void {
    if (!this.category || this.isDeleting || this.isSaving) {
      return;
    }

    const categoryId = String(this.category.CategoryID);
    this.isDeleting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.httpService
      .delete<{ deleted: boolean }>(`http://localhost:4200/api/categories/${categoryId}`)
      .pipe(
        tap(() => {
          this.router.navigate(['/categories'], {
            queryParams: { deleted: '1' }
          });
        }),
        catchError(() => {
          this.errorMessage = 'Unable to delete category.';
          return EMPTY;
        }),
        finalize(() => {
          this.isDeleting = false;
        })
      )
      .subscribe();
  }
}

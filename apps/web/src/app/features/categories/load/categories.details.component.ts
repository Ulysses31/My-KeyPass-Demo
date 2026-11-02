import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryDto } from '../../../shared/dto/category-dto';
import { BaseLoadComponent } from '../../../shared/features/load/base.load';
import { CategoriesService } from '../services/categories.service';

@Component({
  selector: 'app-categories-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BaseLoadComponent],
  providers: [],
  templateUrl: './categories.details.component.html'
})
export class CategoriesDetailsComponent
  extends BaseLoadComponent<CategoryDto>
  implements OnInit
{
  readonly categoriesService: CategoriesService = inject(CategoriesService);
  category: CategoryDto | null = null;

  categoriesForm: FormGroup = new FormGroup({
    CategoryID: new FormControl({ value: 0, disabled: true }, { nonNullable: true }),
    Name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(2), Validators.maxLength(60)]
    }),
    Description: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(250)]
    }),
    NameWithBadge: new FormControl(
      { value: '', disabled: true },
      {
        nonNullable: true,
        validators: [Validators.required, Validators.maxLength(80)]
      }
    )
  });

  constructor() {
    super();
    effect(() => {
      this.categoriesForm.reset(this.categoriesService.loaderItem());
    });
  }

  override ngOnInit(): void {
    super.ngOnInit();
    //this.actRouter.params
    //  .pipe(
    //    takeUntilDestroyed(this.destroyRef),
    //    switchMap((params) => {
    //      const id = String(params['id'] ?? '');
    //      const categoryId = Number(id);
    //      if (!id || categoryId < 0) {
    //        this.errorMessage = 'Invalid category id.';
    //        this.toastr.error('Invalid category id.');
    //        this.isLoading = false;
    //        return EMPTY;
    //      }
    //      //** CREATE NEW */
    //      if (categoryId === 0) {
    //        this.deleteToggle = false;
    //        this.errorMessage = '';
    //        this.successMessage = '';
    //        this.isLoading = false;
    //        this.categoryForm.reset(
    //          {
    //            CategoryID: '0',
    //            Name: '',
    //            Description: '',
    //            NameWithBadge: ''
    //          },
    //          { emitEvent: false }
    //        );
    //        this.category = {
    //          CategoryID: 0,
    //          Name: '',
    //          Description: '',
    //          NameWithBadge: ''
    //        };
    //        this.categoryForm.markAsPristine();
    //        return EMPTY;
    //      }
    //      //** EDIT */
    //      if (categoryId > 0) {
    //        this.deleteToggle = true;
    //        this.errorMessage = '';
    //        this.successMessage = '';
    //        this.isLoading = true;
    //        return this.httpService
    //          .get<CategoryDto>(`http://localhost:4200/api/categories/${id}`)
    //          .pipe(
    //            tap((response) => {
    //              this.category = response;
    //              this.categoryForm.reset(
    //                {
    //                  CategoryID: String(response.CategoryID ?? ''),
    //                  Name: response.Name ?? '',
    //                  Description: response.Description ?? '',
    //                  NameWithBadge: response.NameWithBadge ?? ''
    //                },
    //                { emitEvent: false }
    //              );
    //              this.categoryForm.markAsPristine();
    //            }),
    //            catchError(() => {
    //              this.category = null;
    //              this.errorMessage = 'Unable to load category details.';
    //              this.toastr.error('Unable to load category details.');
    //              return EMPTY;
    //            }),
    //            finalize(() => {
    //              this.isLoading = false;
    //            })
    //          );
    //      }
    //      this.errorMessage = 'Invalid category id.';
    //      this.isLoading = false;
    //      return EMPTY;
    //    })
    //  )
    //  .subscribe();
  }

  override onSubmit(): void {
    super.onSubmit(this.categoriesService, this.categoriesForm);
    // if (!this.category) {
    //   return;
    // }
    // if (this.categoryForm.invalid) {
    //   this.categoryForm.markAllAsTouched();
    //   return;
    // }
    // const categoryId = String(this.category.CategoryID);
    // //** INSERT */
    // if (Number(categoryId) === 0) {
    //   this.isSaving = true;
    //   this.errorMessage = '';
    //   this.successMessage = '';
    //   this.httpService
    //     .post<CategoryDto>(`http://localhost:4200/api/categories`, {
    //       Name: this.categoryForm.controls.Name.value.trim(),
    //       Description: this.categoryForm.controls.Description.value.trim(),
    //       NameWithBadge: this.categoryForm.controls.NameWithBadge.value.trim()
    //     })
    //     .pipe(
    //       tap((newCategory) => {
    //         this.category = newCategory;
    //         this.categoryForm.reset(
    //           {
    //             CategoryID: String(newCategory.CategoryID ?? ''),
    //             Name: newCategory.Name ?? '',
    //             Description: newCategory.Description ?? '',
    //             NameWithBadge: newCategory.NameWithBadge ?? ''
    //           },
    //           { emitEvent: false }
    //         );
    //         this.categoryForm.markAsPristine();
    //         this.successMessage = 'Category created successfully.';
    //         this.toastr.success('Category created successfully.');
    //       }),
    //       catchError(() => {
    //         this.errorMessage = 'Unable to create category.';
    //         this.toastr.error('Unable to create category.');
    //         return EMPTY;
    //       }),
    //       finalize(() => {
    //         this.isSaving = false;
    //       })
    //     )
    //     .subscribe();
    // }
    // //** UPDATE */
    // if (Number(categoryId) > 0) {
    //   this.isSaving = true;
    //   this.errorMessage = '';
    //   this.successMessage = '';
    //   this.httpService
    //     .patch<CategoryDto>(`http://localhost:4200/api/categories/${categoryId}`, {
    //       Name: this.categoryForm.controls.Name.value.trim(),
    //       Description: this.categoryForm.controls.Description.value.trim(),
    //       NameWithBadge: this.categoryForm.controls.NameWithBadge.value.trim()
    //     })
    //     .pipe(
    //       tap((updatedCategory) => {
    //         this.category = updatedCategory;
    //         this.categoryForm.reset(
    //           {
    //             CategoryID: String(updatedCategory.CategoryID ?? ''),
    //             Name: updatedCategory.Name ?? '',
    //             Description: updatedCategory.Description ?? '',
    //             NameWithBadge: updatedCategory.NameWithBadge ?? ''
    //           },
    //           { emitEvent: false }
    //         );
    //         this.categoryForm.markAsPristine();
    //         this.successMessage = 'Category updated successfully.';
    //         this.toastr.success('Category updated successfully.');
    //       }),
    //       catchError(() => {
    //         this.errorMessage = 'Unable to update category.';
    //         this.toastr.error('Unable to update category.');
    //         return EMPTY;
    //       }),
    //       finalize(() => {
    //         this.isSaving = false;
    //       })
    //     )
    //     .subscribe();
    // }
  }

  override onDelete(): void {
    super.onDelete(this.categoriesService);
    // if (!this.category || this.isDeleting || this.isSaving) {
    //   return;
    // }
    // const categoryId = String(this.category.CategoryID);
    // this.isDeleting = true;
    // this.errorMessage = '';
    // this.successMessage = '';
    // this.httpService
    //   .delete<{ deleted: boolean }>(`http://localhost:4200/api/categories/${categoryId}`)
    //   .pipe(
    //     tap(() => {
    //       this.toastr.success('Category deleted successfully.');
    //       this.router.navigate(['/categories'], {
    //         queryParams: { deleted: '1' }
    //       });
    //     }),
    //     catchError(() => {
    //       this.errorMessage = 'Unable to delete category.';
    //       this.toastr.error('Unable to delete category.');
    //       return EMPTY;
    //     }),
    //     finalize(() => {
    //       this.isDeleting = false;
    //     })
    //   )
    //   .subscribe();
  }

  // override onUpdateBadgeName(): void {
  //   super.onUpdateBadgeName(this.baseForm);
  // }
}

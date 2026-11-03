/**
 * Categories detail form component.
 *
 * Handles create and update operations for category entries.
 */
import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CategoryDto } from '../../../shared/dto/category-dto';
import { BaseLoadComponent } from '../../../shared/features/load/base.load';
import { CategoriesService } from '../services/categories.service';

/**
 * Form view for category details and deletion confirmation.
 */
@Component({
  selector: 'app-categories-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BaseLoadComponent],
  providers: [],
  templateUrl: './categories.details.component.html'
})
/**
 * Form view for category details and category deletion.
 */
export class CategoriesDetailsComponent
  extends BaseLoadComponent<CategoryDto>
  implements OnInit
{
  readonly categoriesService: CategoriesService = inject(CategoriesService);
  category: CategoryDto | null = null;

  override readonly title = $localize`Categories`;
  override readonly deleteConfirmationTitle = $localize`Delete category?`;
  override readonly deleteConfirmationDescription = $localize`This action will permanently delete the selected category.`;
  override readonly description = $localize`Modify records by type and keep your vault structured.`;

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
  }

  override onSubmit(): void {
    super.onSubmit(this.categoriesService, this.categoriesForm);
  }
}

import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { CategoryDto } from '../../../shared/dto/category-dto';
import { BaseBrowseComponent } from '../../../shared/features/browse/base.browse';
import { CategoriesService } from '../services/categories.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, BaseBrowseComponent],
  templateUrl: './categories.component.html'
})
export class CategoriesComponent
  extends BaseBrowseComponent<CategoryDto>
  implements OnInit
{
  readonly categoriesService: CategoriesService = inject(CategoriesService);
  override readonly headerNames: string[] = ['Name', 'Description'];
  override readonly title: string = $localize`Categories`;
  override readonly description: string = $localize`Organize records by type and keep your vault structured.`;

  override ngOnInit(): void {
    super.ngOnInit();
  }
}

import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { CategoryDto } from '../../../shared/dto/category-dto';
import { BaseBrowseComponent } from '../../../shared/features/browse/base.browse';
import { CategoriesService } from '../services/categories.service';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule, BaseBrowseComponent],
  templateUrl: './categoriesNew.component.html'
})
export class CategoriesNewComponent
  extends BaseBrowseComponent<CategoryDto>
  implements OnInit
{
  readonly categoriesService: CategoriesService = inject(CategoriesService);
  override readonly headerNames: string[] = ['Name', 'Description'];

  override ngOnInit(): void {
    super.ngOnInit();
  }

  // getSelected(id: number): void {
  //   this.router.navigate(['/categories', id]);
  // }
}

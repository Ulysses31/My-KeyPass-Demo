import { Injectable } from '@angular/core';
import { CategoryDto } from '../../../shared/dto/category-dto';
import { BaseService } from '../../../shared/services/base.service';

@Injectable({ providedIn: 'root' })
export class CategoriesService extends BaseService<CategoryDto> {
  protected _url = 'http://localhost:4200/api/categories';

  constructor() {
    super();
  }
}

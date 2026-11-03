/**
 * Category service.
 *
 * Provides HTTP access to the categories resource in the JSON API.
 */
import { Injectable } from '@angular/core';
import { CategoryDto } from '../../../shared/dto/category-dto';
import { BaseService } from '../../../shared/services/base.service';

/**
 * Resource-specific service for category CRUD operations.
 */
@Injectable({ providedIn: 'root' })
export class CategoriesService extends BaseService<CategoryDto> {
  protected _url = 'http://localhost:4200/api/categories';

  constructor() {
    super();
  }
}

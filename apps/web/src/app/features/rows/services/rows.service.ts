/**
 * Rows service.
 *
 * Provides HTTP access to the rows resource in the JSON API.
 */
import { Injectable } from '@angular/core';
import { RecordDto } from '../../../shared/dto/record-dto';
import { BaseService } from '../../../shared/services/base.service';

/**
 * Resource-specific service for row CRUD operations.
 */
@Injectable({ providedIn: 'root' })
export class RowsService extends BaseService<RecordDto> {
  protected _url = 'http://localhost:4200/api/rows';

  constructor() {
    super();
  }
}

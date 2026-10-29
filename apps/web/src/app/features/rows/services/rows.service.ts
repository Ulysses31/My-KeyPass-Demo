import { Injectable } from '@angular/core';
import { RecordDto } from '../../../shared/dto/record-dto';
import { BaseService } from '../../../shared/services/base.service';

@Injectable({ providedIn: 'root' })
export class RowsService extends BaseService<RecordDto> {
  protected _url = 'http://localhost:4200/api/rows';

  constructor() {
    super();
  }
}

import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import { RecordDto } from '../../../shared/dto/record-dto';
import { BaseBrowseComponent } from '../../../shared/features/browse/base.browse';
import { RowsService } from '../services/rows.service';

@Component({
  selector: 'app-rows',
  standalone: true,
  imports: [CommonModule, BaseBrowseComponent],
  templateUrl: './rows.component.html',
  styleUrls: ['./rows.component.scss']
})
export class RowsComponent extends BaseBrowseComponent<RecordDto> implements OnInit {
  readonly rowsService: RowsService = inject(RowsService);
  override readonly headerNames: string[] = ['Title'];

  override ngOnInit(): void {
    super.ngOnInit();
  }
}

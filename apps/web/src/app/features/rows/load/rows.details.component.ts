import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { tap } from 'rxjs';
import { RecordDto } from '../../../shared/dto/record-dto';

@Component({
  selector: 'app-rows-details',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rows.details.component.html'
})
export class RowsDetailsComponent implements OnInit {
  httpService: HttpClient = inject(HttpClient);
  actRouter: ActivatedRoute = inject(ActivatedRoute);

  record: RecordDto | null = null;
  categories: any[] = [];

  ngOnInit(): void {
    this.actRouter.params.subscribe((params) => {
      if (params['id'] > 0) {
        this.getRecord(params['id'] as string);
      }
    });
  }

  private getRecord(id: string): void {
    this.httpService
      .get<RecordDto>(`http://localhost:4200/api/rows/${id}`)
      .pipe(
        tap((response: RecordDto) => {
          // console.log('Record response:', response);
          this.record = response;
        })
      )
      .subscribe();
  }
}

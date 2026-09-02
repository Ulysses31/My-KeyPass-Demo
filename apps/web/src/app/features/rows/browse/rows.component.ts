import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { map, tap } from 'rxjs/operators';
import { RecordDto } from '../../../shared/dto/record-dto';

@Component({
  selector: 'app-rows',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './rows.component.html'
})
export class RowsComponent implements OnInit {
  httpService: HttpClient = inject(HttpClient);
  router: Router = inject(Router);

  records: any[] = [];
  categories: any[] = [];

  ngOnInit(): void {
    // this.getRecords();
    this.getData();
  }

  private getData(): void {
    this.httpService
      .get<{ rows: any[]; categories: any[] }>('http://localhost:4200/api/data')
      .pipe(
        map((response: { rows: any[]; categories: any[] }) => {
          // console.log('Data response:', response.rows);
          for (const record of response.rows) {
            const category = response.categories.find(
              (cat) => cat.CategoryID === record.CategoryID
            );
            if (category) {
              record.Category = category;
            }
          }
          response.rows.sort((a, b) => a.CategoryID.localeCompare(b.CategoryID));
          return response.rows;
        }),
        tap((records: any[]) => {
          // console.log(records);
          this.records = records;
        })
      )
      .subscribe();
  }

  private getRecords(): void {
    this.httpService
      .get<RecordDto[]>('http://localhost:4200/api/rows')
      .pipe(
        tap((response: RecordDto[]) => {
          // console.log('Records response:', response);
          this.records = response;
        })
      )
      .subscribe();
  }

  getSelected(id: string): void {
    this.router.navigate(['/rows', id]);
  }
}

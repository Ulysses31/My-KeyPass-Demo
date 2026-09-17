import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, EMPTY, finalize } from 'rxjs';
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
  route: ActivatedRoute = inject(ActivatedRoute);
  destroyRef: DestroyRef = inject(DestroyRef);

  records: any[] = [];
  categories: any[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';

  ngOnInit(): void {
    this.route.queryParamMap
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((params) => {
        this.successMessage = '';

        if (params.get('recycled') === '1') {
          this.successMessage = 'Row moved to Recycle Bin successfully.';
          return;
        }

        if (params.get('deleted') === '1') {
          this.successMessage = 'Row deleted successfully.';
        }
      });

    // this.getRecords();
    this.getData();
  }

  private getData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.httpService
      .get<{ rows: any[]; categories: any[] }>('http://localhost:4200/api/data')
      .pipe(
        map((response: { rows: any[]; categories: any[] }) => {
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
          this.records = records;
        }),
        catchError(() => {
          this.records = [];
          this.errorMessage = 'Unable to load rows.';
          return EMPTY;
        }),
        finalize(() => {
          this.isLoading = false;
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

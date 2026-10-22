import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, EMPTY, finalize } from 'rxjs';
import { map, tap } from 'rxjs/operators';

interface RowCategoryOption {
  id: string;
  name: string;
}

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
  allRecords: any[] = [];
  categories: any[] = [];
  isLoading = true;
  errorMessage = '';
  successMessage = '';
  selectedRowCategoryId = 'all';
  rowCategoryOptions: RowCategoryOption[] = [];

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

    this.getData();
  }

  private getData(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.httpService
      .get<{ rows: any[]; categories: any[] }>('http://localhost:4200/api/data')
      .pipe(
        map((response: { rows: any[]; categories: any[] }) => {
          this.rowCategoryOptions = response.categories
            .map((cat) => ({
              id: String(cat.CategoryID ?? ''),
              name: String(cat.Name ?? '')
            }))
            .sort((a, b) => a.name.localeCompare(b.name));

          for (const record of response.rows) {
            const category = response.categories.find(
              (cat) => cat.CategoryID === record.CategoryID
            );
            if (category) {
              record.Category = category;
            }
          }
          response.rows.sort((a, b) =>
            String(a.CategoryID ?? '').localeCompare(String(b.CategoryID ?? ''))
          );
          return response.rows;
        }),
        tap((records: any[]) => {
          this.records = records;
          this.allRecords = records;
        }),
        catchError(() => {
          this.records = [];
          this.allRecords = [];
          this.errorMessage = 'Unable to load rows.';
          return EMPTY;
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe();
  }

  getSelected(id: string): void {
    this.router.navigate(['/rows', id]);
  }

  applyCategoryFilter(categoryId: string): void {
    this.selectedRowCategoryId = categoryId;

    if (categoryId === 'all') {
      this.records = [...this.allRecords];
      return;
    }

    this.records = this.allRecords.filter((row) => row.CategoryID === categoryId);
  }
}

import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { catchError, finalize, map, of, tap } from 'rxjs';

interface SummaryCard {
  label: string;
  value: string;
  change: string;
  tone: 'indigo' | 'emerald' | 'amber' | 'rose';
}

interface DashboardRow {
  RecordID: string;
  Title: string;
  Username: string;
  Password: string;
  URL: string;
  CategoryID: string;
  CategoryName: string;
}

interface RowCategoryOption {
  id: string;
  name: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  httpService: HttpClient = inject(HttpClient);

  summaryCards: SummaryCard[] = [
    {
      label: 'Total entries',
      value: '128',
      change: '+12 this week',
      tone: 'indigo'
    },
    {
      label: 'Strong passwords',
      value: '94%',
      change: '+4.2%',
      tone: 'emerald'
    },
    {
      label: 'Security checks',
      value: '18',
      change: '3 pending',
      tone: 'amber'
    },
    { label: 'At risk', value: '2', change: 'Needs review', tone: 'rose' }
  ];

  rows: DashboardRow[] = [];
  allRows: DashboardRow[] = [];
  rowCategoryOptions: RowCategoryOption[] = [];
  selectedRowCategoryId = 'all';
  isRowsLoading = true;
  rowsErrorMessage = '';

  categories = [
    { name: 'Banking', count: 12, color: 'bg-indigo-100 text-indigo-700' },
    { name: 'Email', count: 8, color: 'bg-sky-100 text-sky-700' },
    { name: 'Developer', count: 17, color: 'bg-violet-100 text-violet-700' },
    { name: 'Shopping', count: 10, color: 'bg-amber-100 text-amber-700' }
  ];

  ngOnInit(): void {
    this.getRows();
  }

  private getRows(): void {
    this.isRowsLoading = true;
    this.rowsErrorMessage = '';

    this.httpService
      .get<{ rows: any[]; categories: any[] }>('http://localhost:4200/api/data')
      .pipe(
        map((response) => {
          const categoryOptions = response.categories
            .map((category) => ({
              id: String(category.CategoryID ?? ''),
              name: String(category.Name ?? '')
            }))
            .filter((category) => category.id && category.name)
            .sort((a, b) => a.name.localeCompare(b.name));

          const rows = response.rows.map((row) => {
            const category = response.categories.find(
              (cat) => String(cat.CategoryID) === String(row.CategoryID)
            );

            return {
              RecordID: String(row.RecordID ?? ''),
              Title: row.Title ?? '',
              Username: row.Username ?? '',
              Password: row.Password ?? '',
              URL: row.URL ?? '',
              CategoryID: String(row.CategoryID ?? ''),
              CategoryName: category?.Name ?? '-'
            } as DashboardRow;
          });

          return { rows, categoryOptions };
        }),
        tap(({ rows, categoryOptions }) => {
          this.rowCategoryOptions = categoryOptions;
          this.allRows = rows;
          this.applyCategoryFilter(this.selectedRowCategoryId);
        }),
        catchError(() => {
          this.rowCategoryOptions = [];
          this.allRows = [];
          this.rows = [];
          this.rowsErrorMessage = 'Unable to load rows data.';
          return of({
            rows: [] as DashboardRow[],
            categoryOptions: [] as RowCategoryOption[]
          });
        }),
        finalize(() => {
          this.isRowsLoading = false;
        })
      )
      .subscribe();
  }

  applyCategoryFilter(categoryId: string): void {
    this.selectedRowCategoryId = categoryId;

    if (categoryId === 'all') {
      this.rows = [...this.allRows];
      return;
    }

    this.rows = this.allRows.filter((row) => row.CategoryID === categoryId);
  }
}

import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { catchError, finalize, map, of, tap } from 'rxjs';
import { RecordDto } from '../../shared/dto/record-dto';
import { HeroIconComponent } from '../../shared/hero-icon/hero-icon.component';
import { CryptoService } from '../../shared/services/encrypt.decrypt';

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
  EncryptedPassword: string;
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
  imports: [CommonModule, HeroIconComponent],
  templateUrl: './dashboard.component.html'
})
export class DashboardComponent implements OnInit {
  httpService: HttpClient = inject(HttpClient);
  cryptoService: CryptoService = inject(CryptoService);

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
  selectedRowTitle = '';
  selectedRowCategoryId = 'all';
  isRowsLoading = true;
  rowsErrorMessage = '';
  encryptedPassword: string = '';
  masterPassword = '12345678'; // Replace with actual master password

  categories = [
    { name: 'Banking', count: 12, color: 'bg-indigo-100 text-indigo-700' },
    { name: 'Email', count: 8, color: 'bg-sky-100 text-sky-700' },
    { name: 'Developer', count: 17, color: 'bg-violet-100 text-violet-700' },
    { name: 'Shopping', count: 10, color: 'bg-amber-100 text-amber-700' }
  ];

  ngOnInit(): void {
    this.getRows();
  }

  private async getRows(): Promise<void> {
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

          const rows = response.rows.map((row: RecordDto) => {
            if (!row.EncryptedPassword) {
              if (row.Password.length > 0) {
                this.cryptoService
                  .encryptString(row.Password, this.masterPassword)
                  .then((encrypted) => {
                    row.EncryptedPassword = encrypted;
                    this.httpService
                      .patch<RecordDto>(
                        `http://localhost:4200/api/rows/${row.RecordID}`,
                        {
                          EncryptedPassword: row.EncryptedPassword
                        }
                      )
                      .subscribe();
                    console.log('Created missing encrypted password for row:', row);
                  });
              }
            }

            const category = response.categories.find(
              (cat) => String(cat.CategoryID) === String(row.CategoryID)
            );

            return {
              RecordID: String(row.RecordID ?? ''),
              Title: row.Title ?? '',
              Username: row.Username ?? '',
              // Password: row.Password ?? '',
              Password: '*'.repeat(row.Password?.length ?? 0),
              EncryptedPassword: row.EncryptedPassword ?? '',
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

    if (categoryId === 'all' && this.selectedRowTitle.length === 0) {
      this.rows = [...this.allRows];
      return;
    }

    if (this.selectedRowTitle.length > 0) {
      if (categoryId === 'all') {
        this.rows = this.allRows.filter((row) =>
          row.Title.toLowerCase().includes(this.selectedRowTitle.toLowerCase())
        );
      } else {
        this.rows = this.allRows.filter(
          (row) =>
            row.CategoryID === categoryId &&
            row.Title.toLowerCase().includes(this.selectedRowTitle.toLowerCase())
        );
      }
    } else {
      this.rows = this.allRows.filter((row) => row.CategoryID === categoryId);
    }
  }

  applyTitleFilter(title: string): void {
    this.selectedRowTitle = title;

    if (!title) {
      if (this.selectedRowCategoryId === 'all') {
        this.rows = [...this.allRows];
      } else {
        this.rows = this.allRows.filter(
          (row) => row.CategoryID === this.selectedRowCategoryId
        );
      }
      return;
    }

    if (this.selectedRowCategoryId === 'all') {
      this.rows = this.allRows.filter((row) =>
        row.Title.toLowerCase().includes(title.toLowerCase())
      );
    } else {
      this.rows = this.allRows.filter(
        (row) =>
          row.CategoryID === this.selectedRowCategoryId &&
          row.Title.toLowerCase().includes(title.toLowerCase())
      );
    }
  }

  async copyPassword(password: string): Promise<void> {
    const decryptedPassword = await this.cryptoService.decryptString(
      password,
      this.masterPassword
    );

    navigator.clipboard.writeText(decryptedPassword).then(
      () => {
        console.log('Password copied to clipboard');
      },
      (err) => {
        console.error('Failed to copy password: ', err);
      }
    );
  }
}

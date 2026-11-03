import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, OnInit, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
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

interface CategorySummary {
  name: string;
  count: number;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, HeroIconComponent],
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss']
})
export class DashboardComponent implements OnInit {
  httpService: HttpClient = inject(HttpClient);
  cryptoService: CryptoService = inject(CryptoService);
  toastr: ToastrService = inject(ToastrService);

  summaryCards: SummaryCard[] = [
    {
      label: 'Total Categories',
      value: '0',
      change: 'Active',
      tone: 'indigo'
    },
    {
      label: 'Total Entries',
      value: '0',
      change: 'Active',
      tone: 'emerald'
    }
    // {
    //   label: 'Security checks',
    //   value: '18',
    //   change: '3 pending',
    //   tone: 'amber'
    // },
    // { label: 'At risk', value: '2', change: 'Needs review', tone: 'rose' }
  ];

  summaryPerCategory: SummaryCard[] = [];

  rows: DashboardRow[] = [];
  allRows: DashboardRow[] = [];
  rowsCount = 0;
  categoriesCount = 0;
  rowCategoryOptions: RowCategoryOption[] = [];
  selectedRowTitle = '';
  selectedRowCategoryId = 'all';
  isRowsLoading = true;
  rowsErrorMessage = '';
  encryptedPassword: string = '';
  masterPassword = '12345678'; // Replace with actual master password

  categoriesColors = [
    'bg-indigo-100 text-indigo-700',
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-rose-100 text-rose-700'
  ];

  categories: CategorySummary[] = [
    // { name: 'Banking', count: 12, color: 'bg-indigo-100 text-indigo-700' },
    // { name: 'Email', count: 8, color: 'bg-sky-100 text-sky-700' },
    // { name: 'Developer', count: 17, color: 'bg-violet-100 text-violet-700' },
    // { name: 'Shopping', count: 10, color: 'bg-amber-100 text-amber-700' }
  ];

  ngOnInit(): void {
    this.getRows();
  }

  private async getRows(): Promise<void> {
    this.isRowsLoading = true;
    this.rowsErrorMessage = '';

    this.httpService
      .get<{
        rows: any[];
        rowsCount: number;
        categories: any[];
        categoriesCount: number;
      }>('http://localhost:4200/api/data')
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

          return {
            rows,
            rowsCount: rows.length,
            categoryOptions,
            categoriesCount: categoryOptions.length
          };
        }),
        tap(({ rows, rowsCount, categoryOptions, categoriesCount }) => {
          this.rowCategoryOptions = categoryOptions;
          this.allRows = rows;
          this.rowsCount = rowsCount;
          this.categoriesCount = categoriesCount;
          this.summaryCards[0].value = String(this.categoriesCount);
          this.summaryCards[1].value = String(this.rowsCount);
          this.applyCategoryFilter(this.selectedRowCategoryId);
          this.getSummaryByCategory();
        }),
        catchError(() => {
          this.rowCategoryOptions = [];
          this.allRows = [];
          this.rows = [];
          this.rowsErrorMessage = 'Unable to load rows data.';
          this.toastr.error('Unable to load rows data.');
          return of({
            rows: [] as DashboardRow[],
            categoryOptions: [] as RowCategoryOption[],
            rowsCount: 0,
            categoriesCount: 0
          });
        }),
        finalize(() => {
          this.isRowsLoading = false;
        })
      )
      .subscribe();
  }

  private getSummaryByCategory(): void {
    // this.summaryPerCategory = this.rowCategoryOptions.map((category) => {
    // const rowsInCategory = this.allRows.filter((row) => row.CategoryID === category.id);
    // return {
    //   label: 'Total entries for category',
    //   value: String(rowsInCategory.length),
    //   tone: 'indigo',
    //   change: category.name
    // };
    this.categories = this.rowCategoryOptions.map((category) => {
      const rowsInCategory = this.allRows.filter((row) => row.CategoryID === category.id);
      return {
        name: category.name,
        count: rowsInCategory.length,
        color: this.categoriesColors[Math.floor(Math.random() * 4)]
      };
    });
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
        this.toastr.success('Password copied to clipboard');
      },
      (err) => {
        console.error('Failed to copy password: ', err);
        this.toastr.error('Failed to copy password');
      }
    );
  }
}

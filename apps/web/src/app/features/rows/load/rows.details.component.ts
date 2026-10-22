import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, EMPTY, finalize, map, switchMap, tap } from 'rxjs';
import { CategoryDto } from '../../../shared/dto/category-dto';
import { RecordDto } from '../../../shared/dto/record-dto';
import { CryptoService } from '../../../shared/services/encrypt.decrypt';

interface RowCategoryOption {
  id: string;
  name: string;
}

@Component({
  selector: 'app-rows-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './rows.details.component.html'
})
export class RowsDetailsComponent implements OnInit {
  httpService: HttpClient = inject(HttpClient);
  cryptoService: CryptoService = inject(CryptoService);
  actRouter: ActivatedRoute = inject(ActivatedRoute);
  router: Router = inject(Router);
  destroyRef: DestroyRef = inject(DestroyRef);

  record: RecordDto | null = null;
  recordPassword: string = '';
  recordEncryptedPassword: string = '';
  isLoading = true;
  isSaving = false;
  isDeleting = false;
  errorMessage = '';
  successMessage = '';
  masterPassword = '12345678'; // Replace with actual master password

  rowCategoryOptions: RowCategoryOption[] = [];
  categories: CategoryDto[] = [];

  rowForm = new FormGroup({
    RecordID: new FormControl({ value: '', disabled: true }, { nonNullable: true }),
    Title: new FormControl('', {
      nonNullable: true,
      validators: [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(100)
      ]
    }),
    Username: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(100)]
    }),
    Password: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, Validators.maxLength(150)]
    }),
    // EncryptedPassword: new FormControl(
    //   { value: '', disabled: true },
    //   {
    //     nonNullable: true
    //   }
    // ),
    URL: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(300)]
    }),
    Notes: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(500)]
    }),
    CategoryID: new FormControl({ value: '', disabled: false }, { nonNullable: true }),
    CategoryName: new FormControl({ value: '', disabled: true }, { nonNullable: true })
  });

  ngOnInit(): void {
    //* Load categories */
    this.isLoading = true;
    this.httpService
      .get<CategoryDto[]>('http://localhost:4200/api/categories')
      .pipe(
        map((response: CategoryDto[]) => {
          this.categories = response;
          this.rowCategoryOptions = response
            .map((cat) => ({
              id: String(cat.CategoryID ?? ''),
              name: String(cat.Name ?? '')
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
          //return response;
        }),
        catchError(() => {
          this.rowCategoryOptions = [];
          this.errorMessage = 'Unable to load categories.';
          return EMPTY;
        }),
        finalize(() => {
          this.isLoading = false;
        })
      )
      .subscribe();

    //* Load row details */
    this.actRouter.params
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        switchMap((params) => {
          const id = String(params['id'] ?? '');

          if (!id || Number(id) <= 0) {
            this.errorMessage = 'Invalid row id.';
            this.isLoading = false;
            return EMPTY;
          }

          this.errorMessage = '';
          this.successMessage = '';
          this.isLoading = true;

          return this.httpService
            .get<RecordDto>(`http://localhost:4200/api/rows/${id}`)
            .pipe(
              tap((response) => {
                this.record = response;
                this.recordPassword = response.Password ?? '';
                this.recordEncryptedPassword = response.EncryptedPassword ?? '';
                this.rowForm.reset(
                  {
                    RecordID: String(response.RecordID ?? ''),
                    Title: response.Title ?? '',
                    Username: response.Username ?? '',
                    // Password: response.Password ?? '',
                    Password: '*'.repeat(this.recordPassword.length),
                    // EncryptedPassword: response.EncryptedPassword ?? '',
                    URL: response.URL ?? '',
                    Notes: response.Notes ?? '',
                    CategoryID: response.CategoryID.toString(),
                    CategoryName: response.Category?.Name ?? ''
                  },
                  { emitEvent: false }
                );
                this.rowForm.markAsPristine();
              }),
              catchError(() => {
                this.record = null;
                this.errorMessage = 'Unable to load row details.';
                return EMPTY;
              }),
              finalize(() => {
                this.isLoading = false;
              })
            );
        })
      )
      .subscribe();
  }

  async onSubmit(): Promise<void> {
    if (!this.record) {
      return;
    }

    if (this.rowForm.invalid) {
      this.rowForm.markAllAsTouched();
      return;
    }

    let encryptedPassword: string = '';
    await this.encryptPassword(this.rowForm.controls.Password.value.trim()).then(
      (res) => (encryptedPassword = res.encryptedPassword)
    );

    // let decryptedPassword = '';
    // await this.decryptPassword(encryptedPassword).then(
    //   (res) => (decryptedPassword = res.decryptedPassword)
    // );

    // console.log(encryptedPassword);
    // console.log(decryptedPassword);

    const recordId = String(this.record.RecordID);
    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.httpService
      .patch<RecordDto>(`http://localhost:4200/api/rows/${recordId}`, {
        Title: this.rowForm.controls.Title.value.trim(),
        Username: this.rowForm.controls.Username.value.trim(),
        Password: this.rowForm.controls.Password.value.trim(),
        EncryptedPassword: encryptedPassword.trim(),
        URL: this.rowForm.controls.URL.value.trim(),
        Notes: this.rowForm.controls.Notes.value.trim(),
        CategoryID: this.rowForm.controls.CategoryID.value
      })
      .pipe(
        tap((updatedRecord) => {
          this.record = {
            ...updatedRecord,
            Category: this.categories.find(
              (c) => c.CategoryID.toString() === this.rowForm.controls.CategoryID.value
            )!
          };

          this.rowForm.reset(
            {
              RecordID: String(updatedRecord.RecordID ?? ''),
              Title: updatedRecord.Title ?? '',
              Username: updatedRecord.Username ?? '',
              Password: '*'.repeat(updatedRecord.Password?.length ?? 0),
              // EncryptedPassword: updatedRecord.EncryptedPassword ?? '',
              URL: updatedRecord.URL ?? '',
              Notes: updatedRecord.Notes ?? '',
              CategoryName: this.record.Category.Name ?? '',
              CategoryID: this.record.Category.CategoryID?.toString() ?? ''
            },
            { emitEvent: false }
          );
          this.rowForm.markAsPristine();
          this.successMessage = 'Row updated successfully.';
        }),
        catchError(() => {
          this.errorMessage = 'Unable to update row.';
          return EMPTY;
        }),
        finalize(() => {
          this.isSaving = false;
        })
      )
      .subscribe();
  }

  onDelete(): void {
    if (!this.record || this.isDeleting || this.isSaving) {
      return;
    }

    const recordId = String(this.record.RecordID);
    this.isDeleting = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.httpService
      .patch<RecordDto>(`http://localhost:4200/api/rows/${recordId}`, {
        CategoryID: '8'
      })
      .pipe(
        tap(() => {
          this.router.navigate(['/rows'], {
            queryParams: { recycled: '1' }
          });
        }),
        catchError(() => {
          this.errorMessage = 'Unable to move row to Recycle Bin.';
          return EMPTY;
        }),
        finalize(() => {
          this.isDeleting = false;
        })
      )
      .subscribe();
  }

  applyCategoryFilter(categoryId: string): void {
    this.rowForm.controls.CategoryID.setValue(categoryId);
  }

  private async encryptPassword(
    password: string
  ): Promise<{ encryptedPassword: string }> {
    const encryptedPassword = await this.cryptoService.encryptString(
      password,
      this.masterPassword
    );
    return { encryptedPassword };
  }

  private async decryptPassword(
    password: string
  ): Promise<{ decryptedPassword: string }> {
    const decryptedPassword = await this.cryptoService.decryptString(
      password,
      this.masterPassword
    );
    return { decryptedPassword };
  }
}

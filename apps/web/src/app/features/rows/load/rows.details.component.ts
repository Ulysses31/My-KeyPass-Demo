import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { catchError, EMPTY, finalize, switchMap, tap } from 'rxjs';
import { RecordDto } from '../../../shared/dto/record-dto';

@Component({
  selector: 'app-rows-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './rows.details.component.html'
})
export class RowsDetailsComponent implements OnInit {
  httpService: HttpClient = inject(HttpClient);
  actRouter: ActivatedRoute = inject(ActivatedRoute);
  router: Router = inject(Router);
  destroyRef: DestroyRef = inject(DestroyRef);

  record: RecordDto | null = null;
  isLoading = true;
  isSaving = false;
  isDeleting = false;
  errorMessage = '';
  successMessage = '';

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
    URL: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(300)]
    }),
    Notes: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(500)]
    }),
    CategoryName: new FormControl({ value: '', disabled: true }, { nonNullable: true })
  });

  ngOnInit(): void {
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
                this.rowForm.reset(
                  {
                    RecordID: String(response.RecordID ?? ''),
                    Title: response.Title ?? '',
                    Username: response.Username ?? '',
                    Password: response.Password ?? '',
                    URL: response.URL ?? '',
                    Notes: response.Notes ?? '',
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

  onSubmit(): void {
    if (!this.record) {
      return;
    }

    if (this.rowForm.invalid) {
      this.rowForm.markAllAsTouched();
      return;
    }

    const recordId = String(this.record.RecordID);
    const currentCategory = this.record.Category;
    const currentCategoryName = currentCategory?.Name ?? '';
    this.isSaving = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.httpService
      .patch<RecordDto>(`http://localhost:4200/api/rows/${recordId}`, {
        Title: this.rowForm.controls.Title.value.trim(),
        Username: this.rowForm.controls.Username.value.trim(),
        Password: this.rowForm.controls.Password.value.trim(),
        URL: this.rowForm.controls.URL.value.trim(),
        Notes: this.rowForm.controls.Notes.value.trim(),
        CategoryID: this.record.CategoryID
      })
      .pipe(
        tap((updatedRecord) => {
          this.record = {
            ...updatedRecord,
            Category: currentCategory
          };

          this.rowForm.reset(
            {
              RecordID: String(updatedRecord.RecordID ?? ''),
              Title: updatedRecord.Title ?? '',
              Username: updatedRecord.Username ?? '',
              Password: updatedRecord.Password ?? '',
              URL: updatedRecord.URL ?? '',
              Notes: updatedRecord.Notes ?? '',
              CategoryName: currentCategoryName
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
      .delete<{ deleted: boolean }>(`http://localhost:4200/api/rows/${recordId}`)
      .pipe(
        tap(() => {
          this.router.navigate(['/rows'], {
            queryParams: { deleted: '1' }
          });
        }),
        catchError(() => {
          this.errorMessage = 'Unable to delete row.';
          return EMPTY;
        }),
        finalize(() => {
          this.isDeleting = false;
        })
      )
      .subscribe();
  }
}

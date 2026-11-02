import { CommonModule } from '@angular/common';
import { Component, effect, inject, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { of, tap } from 'rxjs';
import { CategoryDto } from '../../../shared/dto/category-dto';
import { RecordDto } from '../../../shared/dto/record-dto';
import { BaseLoadComponent } from '../../../shared/features/load/base.load';
import { CryptoService } from '../../../shared/services/encrypt.decrypt';
import { CategoriesService } from '../../categories/services/categories.service';
import { RowsService } from '../services/rows.service';

interface RowCategoryOption {
  id: string;
  name: string;
}

@Component({
  selector: 'app-rows-details',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, BaseLoadComponent],
  templateUrl: './rows.details.component.html'
})
export class RowsDetailsComponent extends BaseLoadComponent<RecordDto> implements OnInit {
  readonly cryptoService: CryptoService = inject(CryptoService);
  readonly rowsService: RowsService = inject(RowsService);
  readonly categoriesService: CategoriesService = inject(CategoriesService);
  readonly masterPassword = '12345678'; // Replace with actual master password

  rowCategoryOptions: RowCategoryOption[] = [];
  categories: CategoryDto[] = [];
  private recordPassword: string = '';
  private recordEncryptedPassword: string = '';
  private formSubmitted: boolean = false;

  rowForm = new FormGroup({
    RecordID: new FormControl({ value: 0, disabled: true }, { nonNullable: true }),
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
    EncryptedPassword: new FormControl(
      { value: '', disabled: true },
      {
        nonNullable: true
      }
    ),
    URL: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(300)]
    }),
    Notes: new FormControl('', {
      nonNullable: true,
      validators: [Validators.maxLength(500)]
    }),
    CategoryID: new FormControl(
      { value: '', disabled: false },
      { nonNullable: true, validators: [Validators.required] }
    )
    // CategoryName: new FormControl(
    //   { value: '', disabled: true },
    //   { nonNullable: true, validators: [Validators.required] }
    // )
  });

  constructor() {
    super();
    effect(() => {
      this.rowForm.reset(this.rowsService.loaderItem()!);

      this.route.params.subscribe((params) => {
        const id = String(params['id'] ?? '');

        if (Number(id) > 0) {
          this.recordPassword = this.rowsService.loaderItem()?.Password ?? '';
          this.recordEncryptedPassword =
            this.rowsService.loaderItem()?.EncryptedPassword ?? '';

          this.rowForm.controls.Password.setValue('*'.repeat(this.recordPassword.length));
        }
      });

      // extra lookup for categories
      this.updateCategories();
    });
  }

  override ngOnInit(): void {
    super.ngOnInit();

    // extra lookup for categories
    this.categoriesService.getAll();
  }

  override async onSubmit(): Promise<void> {
    this.formSubmitted = true;

    if (this.rowForm.invalid) {
      this.rowForm.markAllAsTouched();
      return;
    }

    if (this.rowForm.controls.Password.dirty) {
      let encryptedPassword: string = '';
      await this.encryptPassword(this.rowForm.controls.Password.value.trim()).then(
        (res) => {
          encryptedPassword = res.encryptedPassword;
          this.rowForm.controls.EncryptedPassword.setValue(encryptedPassword);
        }
      );

      // let decryptedPassword = '';
      // await this.decryptPassword(encryptedPassword).then(
      //   (res) => (decryptedPassword = res.decryptedPassword)
      // );

      // console.log(encryptedPassword);
      // console.log(decryptedPassword);
    } else {
      this.rowForm.controls.Password.setValue(this.recordPassword);
    }

    super.onSubmit(this.rowsService, this.rowForm);
  }

  override onDelete(): void {
    super.onDelete(this.rowsService);
  }

  private updateCategories(): void {
    of<CategoryDto[]>(this.categoriesService.browserItems() ?? [])
      .pipe(
        tap((data: CategoryDto[]) => {
          this.rowCategoryOptions = data
            .map((cat: CategoryDto) => ({
              id: String(cat.CategoryID),
              name: String(cat.Name)
            }))
            .sort((a, b) => a.name.localeCompare(b.name));
        })
      )
      .subscribe();
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

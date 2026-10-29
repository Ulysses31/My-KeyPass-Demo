import { HttpClient } from '@angular/common/http';
import { computed, inject, Injectable, signal } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({ providedIn: 'root' })
export abstract class BaseService<T, TUpdate = Partial<T>, TCreate = Partial<T>> {
  protected abstract _url: string;
  private readonly httpService: HttpClient = inject(HttpClient);
  private toastr: ToastrService = inject(ToastrService);

  // SIGNALS
  protected readonly browserSignal = signal<T[] | null>(null);
  protected readonly loaderSignal = signal<T | null>({} as T);
  protected readonly loadingSignal = signal<boolean>(false);
  protected readonly errorSignal = signal<string | null>(null);

  readonly browserItems = computed(() => this.browserSignal());
  readonly loaderItem = computed(() => this.loaderSignal());
  readonly loading = computed(() => this.loadingSignal());
  readonly error = computed(() => this.errorSignal());

  constructor() {
    console.log('BaseService<T> ctor...');
  }

  getAll(): void {
    console.log('url getAll', this._url);
    this.browserSignal.set([]);
    this.loaderSignal.set({} as T);
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.httpService.get<T[]>(this._url).subscribe({
      next: (data) => this.browserSignal.set(data),
      error: (err) => {
        this.errorSignal.set(err.message);
        this.loadingSignal.set(false);
        this.toastr.error(err.message);
      },
      complete: () => this.loadingSignal.set(false)
    });
  }

  getById(id: string): void {
    console.log('url getById', this._url);
    this.loaderSignal.set({} as T);
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.httpService.get<T>(`${this._url}/${id}`).subscribe({
      next: (data) => this.loaderSignal.set(data),
      error: (err) => {
        this.errorSignal.set(err.message);
        this.loadingSignal.set(false);
        this.toastr.error(err.message);
      },
      complete: () => this.loadingSignal.set(false)
    });
  }

  create(data: TCreate): void {
    console.log('url create', this._url);
    this.browserSignal.set([]);
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.httpService.post<T>(this._url, data).subscribe({
      next: (created) => {
        this.loaderSignal.set(created);
        this.toastr.success('Item created successfully');
      },
      error: (err) => {
        this.errorSignal.set(err.message);
        this.loadingSignal.set(false);
        this.toastr.error(err.message);
      },
      complete: () => this.loadingSignal.set(false)
    });
  }

  update(id: string, data: TUpdate): void {
    console.log('url update', this._url);
    this.browserSignal.set([]);
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.httpService.put<T>(`${this._url}/${id}`, data).subscribe({
      next: (updated) => {
        this.loaderSignal.set(updated);
        this.toastr.success('Item updated successfully');
      },
      error: (err) => {
        this.errorSignal.set(err.message);
        this.loadingSignal.set(false);
        this.toastr.error(err.message);
      },
      complete: () => this.loadingSignal.set(false)
    });
  }

  delete(id: string): void {
    console.log('url delete', this._url);
    this.browserSignal.set([]);
    this.loadingSignal.set(true);
    this.errorSignal.set(null);
    this.httpService.delete(`${this._url}/${id}`).subscribe({
      next: () => {
        this.browserSignal.set(
          this.browserSignal()!.filter((item) => (item as any).id !== id)
        );
        this.toastr.success('Item deleted successfully');
      },
      error: (err) => {
        this.errorSignal.set(err.message);
        this.loadingSignal.set(false);
        this.toastr.error(err.message);
      },
      complete: () => this.loadingSignal.set(false)
    });
  }
}

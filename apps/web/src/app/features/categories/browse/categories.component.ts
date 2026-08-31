import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { tap } from 'rxjs';
import { CategoryDto } from '../../../shared/dto/category-dto';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [CommonModule],
  providers: [],
  templateUrl: './categories.component.html'
})
export class CategoriesComponent implements OnInit {
  httpService: HttpClient = inject(HttpClient);
  router: Router = inject(Router);

  categories: CategoryDto[] = [];

  ngOnInit(): void {
    this.getCategories();
  }

  private getCategories(): void {
    this.httpService
      .get<CategoryDto[]>('http://localhost:4200/api/categories')
      .pipe(
        tap((response: CategoryDto[]) => {
          // console.log('Categories response:', response);
          this.categories = response;
        })
      )
      .subscribe();
  }

  getSelected(id: number): void {
    this.router.navigate(['/categories', id]);
  }
}

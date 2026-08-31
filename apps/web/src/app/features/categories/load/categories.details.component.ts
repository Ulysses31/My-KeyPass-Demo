import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { tap } from 'rxjs';
import { CategoryDto } from '../../../shared/dto/category-dto';

@Component({
  selector: 'app-categories-details',
  standalone: true,
  imports: [CommonModule],
  providers: [],
  templateUrl: './categories.details.component.html'
})
export class CategoriesDetailsComponent implements OnInit {
  httpService: HttpClient = inject(HttpClient);
  actRouter: ActivatedRoute = inject(ActivatedRoute);

  category: CategoryDto | null = null;

  ngOnInit(): void {
    this.actRouter.params.subscribe((params) => {
      // EDIT
      if (params['id'] > 0) {
        this.getCategory(params['id'] as string);
      }
    });
  }

  private getCategory(id: string): void {
    this.httpService
      .get<CategoryDto>(`http://localhost:4200/api/categories/${id}`)
      .pipe(
        tap((response: CategoryDto) => {
          // console.log('Category response:', response);
          this.category = response;
        })
      )
      .subscribe();
  }
}

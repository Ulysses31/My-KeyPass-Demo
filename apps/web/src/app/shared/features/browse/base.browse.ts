/**
 * Base browse component.
 *
 * Provides a common table/list view pattern with filter controls and row selection.
 */
import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, effect, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HeroIconComponent } from '../../hero-icon/hero-icon.component';
import { BaseService } from '../../services/base.service';
import Shared from '../../shared';

/**
 * Generic browse page used by categories and rows views.
 */
@Component({
  selector: 'app-base-browse',
  standalone: true,
  imports: [CommonModule, HeroIconComponent],
  templateUrl: 'base.browse.html',
  styleUrls: ['base.browse.css']
})
/**
 * Generic browse page used by categories and rows views.
 */
export class BaseBrowseComponent<T> implements OnInit {
  @Input({ required: false }) service!: BaseService<T>;
  @Input({ required: false }) headerNames!: string[];
  router: Router = inject(Router);
  route: ActivatedRoute = inject(ActivatedRoute);
  shared: Shared = inject(Shared);
  selectedCategory: string = '';
  private selectedFilteredText: string = '';
  headers: string[] = [];
  // toastr: ToastrService = inject(ToastrService);

  @Input({ required: true }) title: string = 'Base Browse Component';
  @Input({ required: true }) description: string =
    'This is the base browse component description.';

  constructor() {
    console.log('BaseBrowseComponent ctor...');
    effect(() => {
      if (!this.headers || this.headers.length === 0) {
        this.headers = this.service
          ? this.shared.getHeaders(this.headerNames, this.service)
          : [];
        this.selectedCategory = this.headers[0];
      }
    });
  }

  ngOnInit() {
    this.fetchData();
  }

  refresh(): void {
    this.fetchData();
  }

  private fetchData(): void {
    this.service && this.service.getAll();
  }

  getSelected(id: string): void {
    console.log('Selected item:', id);
    this.route.parent?.children.forEach((child) => {
      child.url.subscribe((url) => {
        console.log(url[0].path);
        this.router.navigate([`/${url[0].path}`, id]);
      });
    });
  }

  applyFilter(filterText: string): void {
    this.selectedFilteredText = filterText;
    this.service.applyFilter(filterText, this.selectedCategory);
  }

  selectFilter(flt: string) {
    this.selectedCategory = flt;
    this.applyFilter(this.selectedFilteredText);
  }
}

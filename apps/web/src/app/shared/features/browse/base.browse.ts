import { CommonModule } from '@angular/common';
import { Component, Input, OnInit, inject } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { HeroIconComponent } from '../../hero-icon/hero-icon.component';
import { BaseService } from '../../services/base.service';
import Shared from '../../shared';

@Component({
  selector: 'app-base-browse',
  standalone: true,
  imports: [CommonModule, HeroIconComponent],
  templateUrl: 'base.browse.html',
  styleUrls: ['base.browse.css']
})
export class BaseBrowseComponent<T> implements OnInit {
  @Input({ required: false }) service!: BaseService<T>;
  @Input({ required: false }) headerNames!: string[];
  router: Router = inject(Router);
  route: ActivatedRoute = inject(ActivatedRoute);
  shared: Shared = inject(Shared);
  // toastr: ToastrService = inject(ToastrService);

  @Input({ required: true }) title: string = 'Base Browse Component';
  @Input({ required: true }) description: string =
    'This is the base browse component description.';

  constructor() {
    console.log('BaseBrowseComponent ctor...');
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
}

import { CommonModule } from '@angular/common';
import { Component, inject, OnInit } from '@angular/core';
import {
  ActivatedRoute,
  NavigationStart,
  Router,
  RouterLink,
  RouterLinkActive,
  RouterOutlet
} from '@angular/router';
import { HeroIconComponent } from './shared/hero-icon/hero-icon.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, HeroIconComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  router: Router = inject(Router);
  route: ActivatedRoute = inject(ActivatedRoute);
  newEntryHide: boolean = false;
  title = $localize`Overview`;
  theme: 'light' | 'dark' = 'light';
  private readonly THEME_KEY = 'keypass-theme';

  ngOnInit(): void {
    // Subscribe to router events to determine if the new entry button should be hidden or shown
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationStart && event.url) {
        console.log('NavigationStart:', event.url);
        if (event.url.includes('/rows') || event.url.includes('/categories')) {
          this.newEntryHide = false;
        }
        if (
          event.url.includes('overview') ||
          event.url.includes('/rows/') ||
          event.url.includes('/categories/')
        ) {
          this.newEntryHide = true;
        }
      }
    });

    const savedTheme = localStorage.getItem(this.THEME_KEY);
    this.theme = savedTheme === 'dark' ? 'dark' : 'light';
    this.applyTheme();
  }

  get isDarkMode(): boolean {
    return this.theme === 'dark';
  }

  toggleTheme(): void {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme();
  }

  applyTheme(): void {
    const root = document.documentElement;
    root.classList.toggle('dark', this.isDarkMode);
    localStorage.setItem(this.THEME_KEY, this.theme);
  }

  onNewEntry() {
    this.route.children.forEach((child) => {
      child.url.subscribe((url) => {
        if (url[0].path === 'rows') {
          this.router.navigate(['/rows', '0']);
        }
        if (url[0].path === 'categories') {
          this.router.navigate(['/categories', '0']);
        }
      });
    });
  }
}

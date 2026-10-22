import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';

type HeroIconName =
  | 'lock-closed'
  | 'home'
  | 'bars-3'
  | 'table-cells'
  | 'sun'
  | 'moon'
  | 'arrow-down-tray'
  | 'plus'
  | 'copy';

@Component({
  selector: 'app-hero-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      [attr.stroke-width]="strokeWidth"
      [ngClass]="sizeClass"
      aria-hidden="true">
      <path stroke-linecap="round" stroke-linejoin="round" [attr.d]="iconPath" />
    </svg>
  `
})
export class HeroIconComponent {
  @Input({ required: true }) name: HeroIconName = 'home';
  @Input() sizeClass = 'h-4 w-4';
  @Input() strokeWidth = 1.8;

  private readonly iconPaths: Record<HeroIconName, string> = {
    'lock-closed':
      'M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 0h10.5A2.25 2.25 0 0119.5 12.75v6A2.25 2.25 0 0117.25 21h-10.5A2.25 2.25 0 014.5 18.75v-6a2.25 2.25 0 012.25-2.25z',
    home: 'm2.25 12 8.954-8.955a1.125 1.125 0 011.591 0L21.75 12M4.5 9.75V19.5A1.5 1.5 0 006 21h4.5v-4.875A1.125 1.125 0 0111.625 15h.75a1.125 1.125 0 011.125 1.125V21H18a1.5 1.5 0 001.5-1.5V9.75',
    'bars-3': 'M3.75 6.75h16.5m-16.5 5.25h16.5m-16.5 5.25h16.5',
    'table-cells':
      'M3.75 3.75h16.5v16.5H3.75V3.75zm5.25 0v16.5m5.25-16.5v16.5M3.75 9h16.5M3.75 14.25h16.5',
    sun: 'M12 3v1.5m0 15V21m8.25-9H21m-18 0H4.5m12.364 6.364 1.061 1.061M6.575 6.575l1.06 1.061m9.728 0 1.061-1.06M6.575 17.425l1.06-1.061M15.75 12a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0z',
    moon: 'M21.752 15.002A9.718 9.718 0 0118 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 003 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 009.002-5.998z',
    'arrow-down-tray':
      'M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-4.5-6L12 15m0 0l-4.5-4.5M12 15V3',
    plus: 'M12 4.5v15m7.5-7.5h-15',
    copy: 'M9 12h3.75M9 15h3.75M9 18h3.75m3 .75H18a2.25 2.25 0 0 0 2.25-2.25V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 0 0-1.123-.08m-5.801 0c-.065.21-.1.433-.1.664 0 .414.336.75.75.75h4.5a.75.75 0 0 0 .75-.75 2.25 2.25 0 0 0-.1-.664m-5.8 0A2.251 2.251 0 0 1 13.5 2.25H15c1.012 0 1.867.668 2.15 1.586m-5.8 0c-.376.023-.75.05-1.124.08C9.095 4.01 8.25 4.973 8.25 6.108V8.25m0 0H4.875c-.621 0-1.125.504-1.125 1.125v11.25c0 .621.504 1.125 1.125 1.125h9.75c.621 0 1.125-.504 1.125-1.125V9.375c0-.621-.504-1.125-1.125-1.125H8.25ZM6.75 12h.008v.008H6.75V12Zm0 3h.008v.008H6.75V15Zm0 3h.008v.008H6.75V18Z'
  };

  get iconPath(): string {
    return this.iconPaths[this.name];
  }
}

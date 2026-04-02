import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  theme = 'light';
  private document = inject(DOCUMENT);

  constructor() {
    this.loadTheme();
  }

  toggleTheme() {
    this.theme = this.theme === 'dark' ? 'light' : 'dark';
    this.applyTheme();
    localStorage.setItem('app-theme', this.theme);
  }

  private loadTheme() {
    const savedTheme = localStorage.getItem('app-theme');
    this.theme = savedTheme === 'dark' ? 'dark' : 'light';
    this.applyTheme();
  }

  private applyTheme() {
    const body = this.document.body;
    body.classList.toggle('dark-mode', this.theme === 'dark');
    body.classList.toggle('light-mode', this.theme === 'light');
  }
}

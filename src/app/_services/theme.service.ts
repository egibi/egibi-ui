import { Injectable, signal, effect } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private readonly THEME_KEY = 'egibi-theme';
  
  isDarkMode = signal<boolean>(false);
  
  constructor() {
    // Initialize theme from localStorage or system preference
    const savedTheme = localStorage.getItem(this.THEME_KEY);
    if (savedTheme) {
      this.isDarkMode.set(savedTheme === 'dark');
    } else {
      // Check system preference
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      this.isDarkMode.set(prefersDark);
    }
    
    // Apply theme on changes
    effect(() => {
      this.applyTheme(this.isDarkMode());
    });
  }
  
  toggle(): void {
    this.isDarkMode.update(v => !v);
    localStorage.setItem(this.THEME_KEY, this.isDarkMode() ? 'dark' : 'light');
  }
  
  setTheme(isDark: boolean): void {
    this.isDarkMode.set(isDark);
    localStorage.setItem(this.THEME_KEY, isDark ? 'dark' : 'light');
  }
  
  private applyTheme(isDark: boolean): void {
    const theme = isDark ? 'dark' : 'light';
    document.documentElement.setAttribute('data-bs-theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
  }
}

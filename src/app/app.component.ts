import { Component, inject, computed, signal } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { SidebarComponent } from './_layout/sidebar/sidebar.component';
import { ThemeService } from './_services/theme.service';
import { HighchartsThemeService } from './_services/highcharts-theme.service';
import { ToastComponent } from './_components/toast/toast.component';
import { BreadcrumbComponent } from './_components/breadcrumb/breadcrumb.component';
import { AuthService } from './auth/auth.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, SidebarComponent, ToastComponent, BreadcrumbComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'egibi-ui';
  sidebarOpen = false;
  sidebarCollapsed = false;
  userMenuOpen = false;
  
  private readonly COLLAPSED_KEY = 'egibi-sidebar-collapsed';
  
  themeService = inject(ThemeService);
  private highchartsTheme = inject(HighchartsThemeService);
  private router = inject(Router);
  auth = inject(AuthService);

  /** Track current URL as a signal so computed properties react to route changes */
  private currentUrl = signal('/');

  /** True when on auth pages (login, signup, etc.) — hides shell chrome */
  isAuthPage = computed(() => this.currentUrl().startsWith('/auth/'));

  /** User initials for the avatar */
  userInitials = computed(() => {
    const user = this.auth.user();
    if (!user) return '?';
    const first = user.given_name?.[0] || user.name?.[0] || user.email?.[0] || '?';
    return first.toUpperCase();
  });
  
  constructor() {
    const saved = localStorage.getItem(this.COLLAPSED_KEY);
    if (saved !== null) {
      this.sidebarCollapsed = saved === 'true';
    }
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event) => {
      this.currentUrl.set((event as NavigationEnd).urlAfterRedirects || (event as NavigationEnd).url);
      this.sidebarOpen = false;
      this.userMenuOpen = false;
    });
  }
  
  toggleSidebar() {
    this.sidebarOpen = !this.sidebarOpen;
  }
  
  closeSidebar() {
    this.sidebarOpen = false;
  }
  
  onSidebarCollapsedChange(collapsed: boolean) {
    this.sidebarCollapsed = collapsed;
  }
  
  toggleTheme() {
    this.themeService.toggle();
  }

  toggleUserMenu() {
    this.userMenuOpen = !this.userMenuOpen;
  }

  logout() {
    this.auth.logout();
  }
  
  get isDarkMode() {
    return this.themeService.isDarkMode();
  }
}

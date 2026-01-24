import { Component, inject } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { SidebarComponent } from './_layout/sidebar/sidebar.component';
import { ThemeService } from './_services/theme.service';
import { HighchartsThemeService } from './_services/highcharts-theme.service';
import { ToastComponent } from './_components/toast/toast.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterModule, SidebarComponent, ToastComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'egibi-ui';
  sidebarOpen = false;
  sidebarCollapsed = false;
  currentPageTitle = 'Dashboard';
  
  private readonly COLLAPSED_KEY = 'egibi-sidebar-collapsed';
  
  themeService = inject(ThemeService);
  private highchartsTheme = inject(HighchartsThemeService); // Initialize Highcharts theme
  private router = inject(Router);
  
  constructor() {
    // Load collapsed state from localStorage
    const saved = localStorage.getItem(this.COLLAPSED_KEY);
    if (saved !== null) {
      this.sidebarCollapsed = saved === 'true';
    }
    
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateCurrentPage();
      // Close sidebar on navigation (mobile)
      this.sidebarOpen = false;
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
  
  get isDarkMode() {
    return this.themeService.isDarkMode();
  }
  
  private updateCurrentPage() {
    const path = this.router.url.split('/')[1]?.split('?')[0] || '';
    const pageMap: Record<string, string> = {
      '': 'Dashboard',
      'accounts': 'Accounts',
      'exchanges': 'Exchanges',
      'markets': 'Markets',
      'strategies': 'Strategies',
      'backtester': 'Backtester',
      'accounting': 'Accounting',
      'data-manager': 'Data Manager',
      'api-tester': 'API Tester',
      'admin': 'Admin',
      'app-configuration': 'Settings'
    };
    this.currentPageTitle = pageMap[path] || 'Dashboard';
  }
}

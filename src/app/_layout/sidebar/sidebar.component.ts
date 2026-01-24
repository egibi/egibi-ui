import { Component, Input, Output, EventEmitter, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { ThemeService } from '../../_services/theme.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  exact?: boolean;
}

interface NavSection {
  title?: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterModule, NgbTooltipModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Output() closeSidebar = new EventEmitter<void>();
  @Output() collapsedChange = new EventEmitter<boolean>();
  
  themeService = inject(ThemeService);
  isMobile = false;
  isCollapsed = false;
  
  private readonly COLLAPSED_KEY = 'egibi-sidebar-collapsed';
  
  navSections: NavSection[] = [
    {
      items: [
        { label: 'Dashboard', route: '/', icon: 'dashboard', exact: true }
      ]
    },
    {
      title: 'Portfolio',
      items: [
        { label: 'Accounts', route: '/accounts', icon: 'wallet' },
        { label: 'Exchanges', route: '/exchanges', icon: 'exchange' },
        { label: 'Markets', route: '/markets', icon: 'chart' }
      ]
    },
    {
      title: 'Trading',
      items: [
        { label: 'Strategies', route: '/strategies', icon: 'zap' },
        { label: 'Backtester', route: '/backtester', icon: 'clock' }
      ]
    },
    {
      title: 'System',
      items: [
        { label: 'Accounting', route: '/accounting', icon: 'calculator' },
        { label: 'Data Manager', route: '/data-manager', icon: 'database' },
        { label: 'Settings', route: '/app-configuration', icon: 'settings' },
        { label: 'API Tester', route: '/api-tester', icon: 'terminal' },
        { label: 'Admin', route: '/admin', icon: 'shield' }
      ]
    }
  ];
  
  constructor() {
    this.checkMobile();
    this.loadCollapsedState();
  }
  
  @HostListener('window:resize')
  onResize() {
    this.checkMobile();
  }
  
  private checkMobile() {
    this.isMobile = window.innerWidth < 992;
    // Auto-expand on mobile
    if (this.isMobile) {
      this.isCollapsed = false;
    }
  }
  
  private loadCollapsedState() {
    const saved = localStorage.getItem(this.COLLAPSED_KEY);
    if (saved !== null && !this.isMobile) {
      this.isCollapsed = saved === 'true';
    }
  }
  
  toggleCollapse() {
    if (!this.isMobile) {
      this.isCollapsed = !this.isCollapsed;
      localStorage.setItem(this.COLLAPSED_KEY, String(this.isCollapsed));
      this.collapsedChange.emit(this.isCollapsed);
    }
  }
  
  close() {
    this.closeSidebar.emit();
  }
  
  toggleTheme() {
    this.themeService.toggle();
  }
  
  get isDarkMode() {
    return this.themeService.isDarkMode();
  }
}

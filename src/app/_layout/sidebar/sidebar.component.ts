import { Component, Input, Output, EventEmitter, inject, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
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
  imports: [CommonModule, RouterModule],
  templateUrl: './sidebar.component.html',
  styleUrl: './sidebar.component.scss'
})
export class SidebarComponent {
  @Input() isOpen = false;
  @Input() isCollapsed = false;
  @Output() closeSidebar = new EventEmitter<void>();
  
  themeService = inject(ThemeService);
  isMobile = false;
  
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
        { label: 'Settings', route: '/app-configuration', icon: 'settings' },
        { label: 'Admin', route: '/admin', icon: 'shield' }
      ]
    }
  ];
  
  constructor() {
    this.checkMobile();
  }
  
  @HostListener('window:resize')
  onResize() {
    this.checkMobile();
  }
  
  private checkMobile() {
    this.isMobile = window.innerWidth < 992;
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

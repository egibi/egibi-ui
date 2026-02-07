import { Injectable, inject, signal, computed } from '@angular/core';
import { Router, NavigationEnd, ActivatedRoute } from '@angular/router';
import { filter } from 'rxjs/operators';

export interface Breadcrumb {
  label: string;
  url: string;
  isHome?: boolean;
  isCurrent?: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class BreadcrumbService {
  private router = inject(Router);
  private activatedRoute = inject(ActivatedRoute);
  
  private _breadcrumbs = signal<Breadcrumb[]>([]);
  public breadcrumbs = this._breadcrumbs.asReadonly();
  
  // Route configuration - maps paths to their display info
  private readonly routeConfig: Record<string, { label: string; parent?: string }> = {
    '': { label: 'Dashboard' },
    'home': { label: 'Dashboard' },
    'accounts': { label: 'Accounts', parent: 'portfolio' },
    'account': { label: 'Account Details', parent: 'accounts' },
    'markets': { label: 'Markets', parent: 'portfolio' },
    'strategies': { label: 'Strategies', parent: 'automation' },
    'backtester': { label: 'Backtester', parent: 'automation' },
    'backtest': { label: 'Backtest Details', parent: 'backtester' },
    'accounting': { label: 'Accounting', parent: 'system' },
    'data-manager': { label: 'Data Manager', parent: 'system' },
    'data-provider': { label: 'Provider Details', parent: 'data-manager' },
    'app-configuration': { label: 'Settings', parent: 'system' },
    'api-tester': { label: 'API Tester', parent: 'system' },
    'admin': { label: 'Admin', parent: 'system' },
  };
  
  // Section labels (virtual parents for grouping)
  private readonly sectionLabels: Record<string, string> = {
    'portfolio': 'Portfolio',
    'trading': 'Trading',
    'system': 'System',
  };
  
  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe(() => {
      this.updateBreadcrumbs();
    });
    
    // Initial breadcrumb generation
    this.updateBreadcrumbs();
  }
  
  private updateBreadcrumbs(): void {
    const url = this.router.url.split('?')[0]; // Remove query params
    const segments = url.split('/').filter(s => s);
    
    const breadcrumbs: Breadcrumb[] = [];
    
    // Always add home
    breadcrumbs.push({
      label: 'Home',
      url: '/',
      isHome: true,
      isCurrent: segments.length === 0
    });
    
    if (segments.length === 0) {
      this._breadcrumbs.set(breadcrumbs);
      return;
    }
    
    // Get the primary route segment (first part)
    const primarySegment = segments[0];
    const config = this.routeConfig[primarySegment];
    
    if (config) {
      // Add section if applicable (Portfolio, Trading, System)
      if (config.parent && this.sectionLabels[config.parent]) {
        breadcrumbs.push({
          label: this.sectionLabels[config.parent],
          url: '', // Sections aren't clickable
          isCurrent: false
        });
      }
      
      // Add the primary page
      breadcrumbs.push({
        label: config.label,
        url: `/${primarySegment}`,
        isCurrent: segments.length === 1
      });
      
      // Handle nested routes (e.g., accounts/account/123)
      if (segments.length > 1) {
        // Check for detail pages
        const nestedSegment = segments[1];
        const nestedConfig = this.routeConfig[nestedSegment];
        
        if (nestedConfig) {
          // If there's an ID parameter, we might want to show it or a name
          const hasId = segments.length > 2;
          let label = nestedConfig.label;
          
          // You could enhance this to fetch the actual name from a service
          // For now, just show the label
          breadcrumbs.push({
            label: label,
            url: url,
            isCurrent: true
          });
        }
      }
    } else {
      // Fallback for unknown routes
      breadcrumbs.push({
        label: this.formatLabel(primarySegment),
        url: url,
        isCurrent: true
      });
    }
    
    // Mark the last item as current
    if (breadcrumbs.length > 0) {
      breadcrumbs[breadcrumbs.length - 1].isCurrent = true;
    }
    
    this._breadcrumbs.set(breadcrumbs);
  }
  
  private formatLabel(segment: string): string {
    return segment
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  }
}

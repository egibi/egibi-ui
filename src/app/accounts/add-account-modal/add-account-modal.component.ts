import { Component, Input, OnInit, ViewChild, ElementRef, AfterViewInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Connection, CREDENTIAL_FIELD_LABELS, SERVICE_CATEGORIES } from '../../_models/connection.model';
import { CreateAccountRequest, AccountCredentials } from '../../_models/account.model';
import { AccountType } from '../../_models/account-type';

/** Maps connection category to account type name for auto-assignment */
const CATEGORY_TO_TYPE: Record<string, string> = {
  crypto_exchange: 'Crypto Exchange',
  stock_broker: 'Stock Broker',
  data_provider: 'Data Provider',
  funding_provider: 'Funding Provider',
};

@Component({
  selector: 'add-account-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-account-modal.component.html',
  styleUrl: './add-account-modal.component.scss',
})
export class AddAccountModalComponent implements OnInit, AfterViewInit, OnDestroy {
  @Input() connections: Connection[] = [];
  @Input() accountTypes: AccountType[] = [];
  @ViewChild('modalBody') modalBody: ElementRef<HTMLDivElement> | undefined;

  // Wizard state
  step: 'pick' | 'configure' = 'pick';

  // Step 1: Service selection
  selectedConnection: Connection | null = null;
  isCustom = false;
  searchQuery = '';
  selectedCategory = '';
  categories = SERVICE_CATEGORIES;
  fieldLabels = CREDENTIAL_FIELD_LABELS;

  // Collapsible category state
  collapsedCategories = new Set<string>();

  // Step 2: Configuration
  accountName = '';
  accountDescription = '';
  accountTypeId: number | null = null;
  baseUrl = '';
  credentials: Record<string, string> = {};
  credentialLabel = '';
  showSecrets: Record<string, boolean> = {};
  saving = false;

  // Scroll to top button state
  showScrollButton = false;
  private scrollListener?: () => void;

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    if (this.modalBody) {
      const el = this.modalBody.nativeElement;
      this.scrollListener = () => {
        this.showScrollButton = el.scrollTop > 200;
      };
      el.addEventListener('scroll', this.scrollListener);
    }
  }

  ngOnDestroy(): void {
    if (this.modalBody && this.scrollListener) {
      this.modalBody.nativeElement.removeEventListener('scroll', this.scrollListener);
    }
  }

  scrollToTop(): void {
    this.modalBody?.nativeElement.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // =============================================
  // STEP 1 — SERVICE PICKER
  // =============================================

  get availableCategories(): { value: string; label: string }[] {
    const activeCats = new Set(this.connections.filter(c => c.isActive).map(c => c.category));
    return this.categories.filter(c => activeCats.has(c.value));
  }

  get filteredConnections(): Connection[] {
    const q = this.searchQuery.toLowerCase().trim();
    let conns = this.connections.filter(c => c.isActive);

    if (this.selectedCategory) {
      conns = conns.filter(c => c.category === this.selectedCategory);
    }

    if (q) {
      conns = conns.filter(
        c =>
          c.name.toLowerCase().includes(q) ||
          (c.description || '').toLowerCase().includes(q) ||
          (c.category || '').toLowerCase().includes(q)
      );
    }

    return conns;
  }

  getGroupedConnections(): { category: string; label: string; items: Connection[] }[] {
    const conns = this.filteredConnections;
    const groups: Record<string, Connection[]> = {};
    for (const conn of conns) {
      const cat = conn.category || 'other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(conn);
    }
    return this.categories
      .filter((c: { value: string; label: string }) => groups[c.value]?.length)
      .map((c: { value: string; label: string }) => ({
        category: c.value,
        label: c.label,
        items: groups[c.value],
      }));
  }

  get isShowingAll(): boolean {
    return !this.selectedCategory;
  }

  toggleCategory(category: string): void {
    if (this.collapsedCategories.has(category)) {
      this.collapsedCategories.delete(category);
    } else {
      this.collapsedCategories.add(category);
    }
  }

  isCategoryCollapsed(category: string): boolean {
    return this.collapsedCategories.has(category);
  }

  /** Whether all groups are currently collapsed */
  get allCollapsed(): boolean {
    const groups = this.getGroupedConnections();
    return groups.length > 0 && groups.every(g => this.collapsedCategories.has(g.category));
  }

  /** Toggle all categories expanded or collapsed */
  toggleAll(): void {
    const groups = this.getGroupedConnections();
    if (this.allCollapsed) {
      // Expand all
      this.collapsedCategories.clear();
    } else {
      // Collapse all
      for (const g of groups) {
        this.collapsedCategories.add(g.category);
      }
    }
  }

  get hasNoResults(): boolean {
    return this.filteredConnections.length === 0 && (!!this.searchQuery || !!this.selectedCategory);
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
  }

  selectService(conn: Connection): void {
    this.selectedConnection = conn;
    this.isCustom = false;
    this.accountName = conn.name + ' Account';
    this.baseUrl = conn.defaultBaseUrl || '';
    this.credentialLabel = conn.name + ' API Key';
    this.credentials = {};
    this.showSecrets = {};

    const requiredFields: string[] = (() => {
      try { return JSON.parse(conn.requiredFields || '[]'); }
      catch { return []; }
    })();
    for (const field of requiredFields) {
      this.credentials[field] = '';
      this.showSecrets[field] = false;
    }

    this.accountTypeId = this.resolveAccountTypeId(conn.category);
    this.step = 'configure';
    this.scrollModalToTop();
  }

  selectCustom(): void {
    this.selectedConnection = null;
    this.isCustom = true;
    this.accountName = '';
    this.baseUrl = '';
    this.credentialLabel = '';
    this.credentials = { api_key: '', api_secret: '' };
    this.showSecrets = {};
    this.accountTypeId = this.resolveAccountTypeId('custom');
    this.step = 'configure';
    this.scrollModalToTop();
  }

  // =============================================
  // STEP 2 — CONFIGURATION
  // =============================================

  get requiredFields(): string[] {
    if (this.selectedConnection) {
      try { return JSON.parse(this.selectedConnection.requiredFields || '[]'); }
      catch { return []; }
    }
    return Object.keys(this.credentials);
  }

  goBack(): void {
    this.step = 'pick';
    this.selectedConnection = null;
    this.isCustom = false;
    this.scrollModalToTop();
  }

  toggleVisibility(field: string): void {
    this.showSecrets[field] = !this.showSecrets[field];
  }

  isSecretField(field: string): boolean {
    return ['api_secret', 'passphrase', 'password'].includes(field);
  }

  get canSave(): boolean {
    if (!this.accountName.trim()) return false;
    for (const field of this.requiredFields) {
      if (!this.credentials[field]?.trim()) return false;
    }
    return true;
  }

  save(): void {
    if (!this.canSave || this.saving) return;
    this.saving = true;

    const request: CreateAccountRequest = {
      name: this.accountName.trim(),
      description: this.accountDescription.trim() || undefined,
      connectionId: this.selectedConnection?.id ?? null,
      accountTypeId: this.accountTypeId || undefined,
      baseUrl: this.baseUrl.trim() || undefined,
      credentials: {
        apiKey: this.credentials['api_key'] || undefined,
        apiSecret: this.credentials['api_secret'] || undefined,
        passphrase: this.credentials['passphrase'] || undefined,
        username: this.credentials['username'] || undefined,
        password: this.credentials['password'] || undefined,
        label: this.credentialLabel.trim() || undefined,
      },
    };

    this.activeModal.close(request);
  }

  dismiss(): void {
    this.activeModal.dismiss('cancelled');
  }

  // =============================================
  // HELPERS
  // =============================================

  private resolveAccountTypeId(category: string): number | null {
    const typeName = CATEGORY_TO_TYPE[category] || 'Custom';
    const match = this.accountTypes.find(t => t.name === typeName);
    return match?.id ?? null;
  }

  private scrollModalToTop(): void {
    setTimeout(() => {
      this.modalBody?.nativeElement.scrollTo({ top: 0, behavior: 'instant' });
    });
  }
}

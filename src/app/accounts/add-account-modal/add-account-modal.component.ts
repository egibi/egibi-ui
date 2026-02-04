import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { Connection, CREDENTIAL_FIELD_LABELS, SERVICE_CATEGORIES } from '../../_models/connection.model';
import { CreateAccountRequest, AccountCredentials } from '../../_models/account.model';
import { AccountType } from '../../_models/account-type';

@Component({
  selector: 'add-account-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-account-modal.component.html',
  styleUrl: './add-account-modal.component.scss',
})
export class AddAccountModalComponent implements OnInit {
  @Input() connections: Connection[] = [];
  @Input() accountTypes: AccountType[] = [];

  // Wizard state
  step: 'pick' | 'configure' = 'pick';

  // Step 1: Service selection
  selectedConnection: Connection | null = null;
  isCustom = false;
  searchQuery = '';
  categories = SERVICE_CATEGORIES;
  fieldLabels = CREDENTIAL_FIELD_LABELS;

  // Step 2: Configuration
  accountName = '';
  accountDescription = '';
  accountTypeId: number | null = null;
  baseUrl = '';
  credentials: Record<string, string> = {};
  credentialLabel = '';
  showSecrets: Record<string, boolean> = {};
  saving = false;

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {}

  // =============================================
  // STEP 1 — SERVICE PICKER
  // =============================================

  get filteredConnections(): Connection[] {
    const q = this.searchQuery.toLowerCase().trim();
    const active = this.connections.filter((c) => c.isActive);
    if (!q) return active;
    return active.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        (c.description || '').toLowerCase().includes(q) ||
        (c.category || '').toLowerCase().includes(q)
    );
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
      .map((c: { value: string; label: string }) => ({ category: c.value, label: c.label, items: groups[c.value] }));
  }

  selectService(conn: Connection): void {
    this.selectedConnection = conn;
    this.isCustom = false;
    this.accountName = conn.name + ' Account';
    this.baseUrl = conn.defaultBaseUrl || '';
    this.credentialLabel = conn.name + ' API Key';
    this.credentials = {};
    this.showSecrets = {};
    // Pre-init credential fields
    for (const field of conn.requiredFieldsList) {
      this.credentials[field] = '';
      this.showSecrets[field] = false;
    }
    this.step = 'configure';
  }

  selectCustom(): void {
    this.selectedConnection = null;
    this.isCustom = true;
    this.accountName = '';
    this.baseUrl = '';
    this.credentialLabel = '';
    this.credentials = { api_key: '', api_secret: '' };
    this.showSecrets = {};
    this.step = 'configure';
  }

  // =============================================
  // STEP 2 — CONFIGURATION
  // =============================================

  get requiredFields(): string[] {
    if (this.selectedConnection) {
      return this.selectedConnection.requiredFieldsList;
    }
    // Custom: show api_key and api_secret by default
    return Object.keys(this.credentials);
  }

  goBack(): void {
    this.step = 'pick';
    this.selectedConnection = null;
    this.isCustom = false;
  }

  toggleVisibility(field: string): void {
    this.showSecrets[field] = !this.showSecrets[field];
  }

  isSecretField(field: string): boolean {
    return ['api_secret', 'passphrase', 'password'].includes(field);
  }

  get canSave(): boolean {
    if (!this.accountName.trim()) return false;
    // Check all required credential fields have values
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
}
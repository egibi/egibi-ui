import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FundingProviderEntry, CreateFundingSourceRequest } from '../funding.service';
import { CREDENTIAL_FIELD_LABELS } from '../../_models/connection.model';

type WizardStep = 'pick-provider' | 'signup-guide' | 'enter-credentials';

@Component({
  selector: 'funding-setup-modal',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './funding-setup-modal.component.html',
  styleUrl: './funding-setup-modal.component.scss',
})
export class FundingSetupModalComponent implements OnInit {
  @Input() providers: FundingProviderEntry[] = [];

  // Wizard state
  step: WizardStep = 'pick-provider';
  selectedProvider: FundingProviderEntry | null = null;
  hasExistingAccount = false;
  fieldLabels = CREDENTIAL_FIELD_LABELS;

  // Credential form
  accountName = '';
  credentials: Record<string, string> = {};
  credentialLabel = '';
  showSecrets: Record<string, boolean> = {};
  saving = false;

  constructor(public activeModal: NgbActiveModal) {}

  ngOnInit(): void {}

  // =============================================
  // STEP 1 — PROVIDER PICKER
  // =============================================

  selectProvider(provider: FundingProviderEntry): void {
    this.selectedProvider = provider;
    this.accountName = `${provider.name} Funding Account`;
    this.credentialLabel = `${provider.name} API Key`;
    this.credentials = {};
    this.showSecrets = {};
    for (const field of provider.requiredFields || []) {
      this.credentials[field] = '';
      this.showSecrets[field] = false;
    }
    this.step = 'signup-guide';
  }

  // =============================================
  // STEP 2 — SIGNUP GUIDE
  // =============================================

  get signupUrl(): string {
    return this.selectedProvider?.signupUrl || '';
  }

  get apiDocsUrl(): string {
    return this.selectedProvider?.apiDocsUrl || '';
  }

  openSignupPage(): void {
    if (this.signupUrl) {
      window.open(this.signupUrl, '_blank');
    }
  }

  openApiDocs(): void {
    if (this.apiDocsUrl) {
      window.open(this.apiDocsUrl, '_blank');
    }
  }

  proceedToCredentials(hasAccount: boolean): void {
    this.hasExistingAccount = hasAccount;
    if (!hasAccount && this.signupUrl) {
      window.open(this.signupUrl, '_blank');
    }
    this.step = 'enter-credentials';
  }

  // =============================================
  // STEP 3 — CREDENTIALS
  // =============================================

  get requiredFields(): string[] {
    return this.selectedProvider?.requiredFields || [];
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
    if (!this.canSave || this.saving || !this.selectedProvider) return;
    this.saving = true;

    const request: CreateFundingSourceRequest = {
      connectionId: this.selectedProvider.connectionId,
      name: this.accountName.trim(),
      description: `Primary funding source via ${this.selectedProvider.name}`,
      baseUrl: this.selectedProvider.defaultBaseUrl,
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

  // =============================================
  // NAVIGATION
  // =============================================

  goBack(): void {
    if (this.step === 'enter-credentials') {
      this.step = 'signup-guide';
    } else if (this.step === 'signup-guide') {
      this.step = 'pick-provider';
      this.selectedProvider = null;
    }
  }

  dismiss(): void {
    this.activeModal.dismiss('cancelled');
  }

  get stepNumber(): number {
    switch (this.step) {
      case 'pick-provider': return 1;
      case 'signup-guide': return 2;
      case 'enter-credentials': return 3;
    }
  }
}

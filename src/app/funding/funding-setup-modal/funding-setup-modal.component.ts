import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';
import { FundingProviderEntry, CreateFundingSourceRequest } from '../funding.service';
import { PlaidLinkService, PlaidLinkResult } from '../plaid-link/plaid-link.service';
import { CREDENTIAL_FIELD_LABELS } from '../../_models/connection.model';

type WizardStep =
  | 'pick-provider'
  // API key flow
  | 'signup-guide'
  | 'enter-credentials'
  // Plaid Link flow
  | 'plaid-link'
  | 'select-account';

/** Result passed back to the parent when modal closes */
export interface FundingSetupResult {
  type: 'api_key' | 'plaid_link';
  /** For api_key flow — the request to create a funding source */
  request?: CreateFundingSourceRequest;
  /** For plaid_link flow — true if bank was successfully linked */
  completed?: boolean;
}

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

  // Credential form (API key flow)
  accountName = '';
  credentials: Record<string, string> = {};
  credentialLabel = '';
  showSecrets: Record<string, boolean> = {};
  saving = false;

  // Plaid Link state
  plaidLinking = false;
  plaidLinkError = '';
  plaidResult: PlaidLinkResult | null = null;
  selectedPlaidAccountId = '';
  plaidAccountName = '';
  plaidExchanging = false;

  constructor(
    public activeModal: NgbActiveModal,
    private plaidLinkService: PlaidLinkService
  ) {}

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

    if (provider.linkMethod === 'plaid_link') {
      // Plaid flow — go directly to link step
      this.plaidLinkError = '';
      this.plaidResult = null;
      this.plaidLinking = false;
      this.step = 'plaid-link';
    } else {
      // API key flow — existing flow
      for (const field of provider.requiredFields || []) {
        this.credentials[field] = '';
        this.showSecrets[field] = false;
      }
      this.step = 'signup-guide';
    }
  }

  // =============================================
  // STEP 2a — SIGNUP GUIDE (API key flow)
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
  // STEP 3a — CREDENTIALS (API key flow)
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

    const result: FundingSetupResult = {
      type: 'api_key',
      request: {
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
      },
    };

    this.activeModal.close(result);
  }

  // =============================================
  // STEP 2b — PLAID LINK
  // =============================================

  launchPlaidLink(): void {
    this.plaidLinking = true;
    this.plaidLinkError = '';

    this.plaidLinkService.openPlaidLink().subscribe({
      next: (result) => {
        this.plaidResult = result;
        this.plaidLinking = false;

        // Pre-select the first account
        if (result.metadata?.accounts?.length > 0) {
          this.selectedPlaidAccountId = result.metadata.accounts[0].id;
          const inst = result.metadata.institution?.name || 'Linked Bank';
          const acct = result.metadata.accounts[0];
          this.plaidAccountName = `${inst} ${acct.subtype || acct.type} (•••${acct.mask})`;
        }

        this.step = 'select-account';
      },
      complete: () => {
        // If complete fires without a next, user exited Plaid Link
        if (!this.plaidResult) {
          this.plaidLinking = false;
        }
      },
      error: (err) => {
        this.plaidLinking = false;
        this.plaidLinkError = err?.error_message || err?.message || 'Failed to connect to your bank. Please try again.';
        console.error('Plaid Link error:', err);
      },
    });
  }

  // =============================================
  // STEP 3b — SELECT ACCOUNT (Plaid flow)
  // =============================================

  get plaidAccounts() {
    return this.plaidResult?.metadata?.accounts || [];
  }

  get plaidInstitution() {
    return this.plaidResult?.metadata?.institution;
  }

  selectPlaidAccount(accountId: string): void {
    this.selectedPlaidAccountId = accountId;
    const inst = this.plaidInstitution?.name || 'Linked Bank';
    const acct = this.plaidAccounts.find((a) => a.id === accountId);
    if (acct) {
      this.plaidAccountName = `${inst} ${acct.subtype || acct.type} (•••${acct.mask})`;
    }
  }

  get canConfirmPlaid(): boolean {
    return !!this.selectedPlaidAccountId && !!this.plaidResult?.publicToken && !this.plaidExchanging;
  }

  confirmPlaidAccount(): void {
    if (!this.canConfirmPlaid || !this.plaidResult || !this.selectedProvider) return;

    this.plaidExchanging = true;

    this.plaidLinkService
      .exchangeToken({
        publicToken: this.plaidResult.publicToken,
        selectedAccountId: this.selectedPlaidAccountId,
        accountName: this.plaidAccountName.trim() || undefined,
        institution: this.plaidInstitution
          ? {
              institutionId: this.plaidInstitution.institution_id,
              name: this.plaidInstitution.name,
            }
          : undefined,
        accounts: this.plaidAccounts.map((a) => ({
          id: a.id,
          name: a.name,
          mask: a.mask,
          type: a.type,
          subtype: a.subtype,
        })),
      })
      .subscribe({
        next: (res) => {
          this.plaidExchanging = false;
          if (res.responseCode === 200) {
            this.activeModal.close({ type: 'plaid_link', completed: true } as FundingSetupResult);
          } else {
            this.plaidLinkError = res.responseMessage || 'Failed to link bank account';
          }
        },
        error: (err) => {
          this.plaidExchanging = false;
          this.plaidLinkError = 'Failed to link bank account. Please try again.';
          console.error('Plaid exchange error:', err);
        },
      });
  }

  // =============================================
  // NAVIGATION
  // =============================================

  goBack(): void {
    this.plaidLinkError = '';

    if (this.step === 'enter-credentials') {
      this.step = 'signup-guide';
    } else if (this.step === 'signup-guide') {
      this.step = 'pick-provider';
      this.selectedProvider = null;
    } else if (this.step === 'plaid-link') {
      this.step = 'pick-provider';
      this.selectedProvider = null;
      this.plaidResult = null;
    } else if (this.step === 'select-account') {
      this.step = 'plaid-link';
      this.plaidResult = null;
    }
  }

  dismiss(): void {
    this.activeModal.dismiss('cancelled');
  }

  get stepNumber(): number {
    switch (this.step) {
      case 'pick-provider':
        return 1;
      case 'signup-guide':
      case 'plaid-link':
        return 2;
      case 'enter-credentials':
      case 'select-account':
        return 3;
    }
  }

  get totalSteps(): number {
    return 3;
  }
}

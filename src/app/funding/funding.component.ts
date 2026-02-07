import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FundingService, FundingSourceResponse, FundingProviderEntry } from './funding.service';
import { PlaidLinkService, PlaidFundingDetails } from './plaid-link/plaid-link.service';
import { NgbGlobalModalService, ModalResult } from '../_services/ngb-global-modal.service';
import { FundingSetupModalComponent, FundingSetupResult } from './funding-setup-modal/funding-setup-modal.component';
import { CreateFundingSourceRequest } from './funding.service';

@Component({
  selector: 'funding',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './funding.component.html',
  styleUrl: './funding.component.scss',
})
export class FundingComponent implements OnInit {
  fundingSource: FundingSourceResponse | null = null;
  providers: FundingProviderEntry[] = [];
  loading = true;
  refreshingBalances = false;

  constructor(
    private fundingService: FundingService,
    private plaidLinkService: PlaidLinkService,
    private modalService: NgbGlobalModalService
  ) {}

  ngOnInit(): void {
    this.loadFundingSource();
    this.loadProviders();
  }

  loadFundingSource(): void {
    this.loading = true;
    this.fundingService.getPrimary().subscribe({
      next: (res) => {
        this.fundingSource = res.responseData || null;
        this.loading = false;
      },
      error: () => {
        this.fundingSource = null;
        this.loading = false;
      },
    });
  }

  loadProviders(): void {
    this.fundingService.getProviders().subscribe({
      next: (res) => {
        this.providers = res.responseData || [];
      },
    });
  }

  setupFunding(): void {
    this.modalService
      .openModal(
        FundingSetupModalComponent,
        { size: 'lg', centered: true, backdrop: 'static' },
        { providers: this.providers }
      )
      .subscribe((result: ModalResult<FundingSetupResult>) => {
        if (result.dismissed || !result.result) return;

        const setupResult = result.result;

        if (setupResult.type === 'plaid_link' && setupResult.completed) {
          // Plaid flow handled everything internally — just reload
          this.loadFundingSource();
        } else if (setupResult.type === 'api_key' && setupResult.request) {
          // API key flow — save via funding service
          this.fundingService.setPrimary(setupResult.request).subscribe({
            next: () => this.loadFundingSource(),
            error: (err) => console.error('Failed to set funding source:', err),
          });
        }
      });
  }

  removeFunding(): void {
    if (!confirm('Remove this funding source? The account will still exist but won\'t be marked as primary.')) {
      return;
    }

    // If it's a Plaid source, also revoke the Plaid connection
    if (this.isPlaidSource && this.fundingSource?.plaidDetails?.plaidItemId) {
      this.plaidLinkService.removeItem(this.fundingSource.plaidDetails.plaidItemId).subscribe({
        next: () => {
          this.fundingService.removePrimary().subscribe({
            next: () => { this.fundingSource = null; },
            error: (err) => console.error('Failed to remove funding source:', err),
          });
        },
        error: (err) => console.error('Failed to remove Plaid connection:', err),
      });
    } else {
      this.fundingService.removePrimary().subscribe({
        next: () => { this.fundingSource = null; },
        error: (err) => console.error('Failed to remove funding source:', err),
      });
    }
  }

  openProviderWebsite(): void {
    if (this.fundingSource?.providerWebsite) {
      window.open(this.fundingSource.providerWebsite, '_blank');
    }
  }

  // =============================================
  // PLAID-SPECIFIC ACTIONS
  // =============================================

  get isPlaidSource(): boolean {
    return this.fundingSource?.linkMethod === 'plaid_link';
  }

  get plaidDetails(): PlaidFundingDetails | null {
    return this.fundingSource?.plaidDetails || null;
  }

  refreshBalances(): void {
    if (!this.plaidDetails?.plaidItemId || this.refreshingBalances) return;
    this.refreshingBalances = true;

    this.plaidLinkService.refreshBalances(this.plaidDetails.plaidItemId).subscribe({
      next: () => {
        this.loadFundingSource();
        this.refreshingBalances = false;
      },
      error: (err) => {
        console.error('Failed to refresh balances:', err);
        this.refreshingBalances = false;
      },
    });
  }

  formatCurrency(amount: number | null | undefined, currency = 'USD'): string {
    if (amount == null) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'USD',
    }).format(amount);
  }
}

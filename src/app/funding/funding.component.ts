import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FundingService, FundingSourceResponse, FundingProviderEntry } from './funding.service';
import { NgbGlobalModalService, ModalResult } from '../_services/ngb-global-modal.service';
import { FundingSetupModalComponent } from './funding-setup-modal/funding-setup-modal.component';
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

  constructor(
    private fundingService: FundingService,
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
      .subscribe((result: ModalResult<CreateFundingSourceRequest>) => {
        if (result.result && !result.dismissed) {
          this.fundingService.setPrimary(result.result).subscribe({
            next: () => {
              this.loadFundingSource();
            },
            error: (err) => {
              console.error('Failed to set funding source:', err);
            },
          });
        }
      });
  }

  removeFunding(): void {
    if (!confirm('Remove this funding source? The account will still exist but won\'t be marked as primary.')) {
      return;
    }
    this.fundingService.removePrimary().subscribe({
      next: () => {
        this.fundingSource = null;
      },
      error: (err) => {
        console.error('Failed to remove funding source:', err);
      },
    });
  }

  openProviderWebsite(): void {
    if (this.fundingSource?.providerWebsite) {
      window.open(this.fundingSource.providerWebsite, '_blank');
    }
  }
}

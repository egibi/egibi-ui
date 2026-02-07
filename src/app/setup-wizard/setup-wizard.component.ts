import { Component, OnInit, Output, EventEmitter, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  SetupWizardService,
  WizardMarket,
  WizardExchange,
  WizardDataSource,
  WizardState,
} from './setup-wizard.service';

@Component({
  selector: 'setup-wizard',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './setup-wizard.component.html',
  styleUrl: './setup-wizard.component.scss',
})
export class SetupWizardComponent implements OnInit {
  @Output() closed = new EventEmitter<void>();

  // Step management
  currentStep = signal(0);
  totalSteps = 5;

  // Data
  markets = signal<WizardMarket[]>([]);
  exchanges = signal<WizardExchange[]>([]);
  dataSources = signal<WizardDataSource[]>([]);

  // Derived
  enabledMarkets = computed(() => this.markets().filter((m) => m.enabled));
  filteredExchanges = computed(() => {
    const enabledMarketIds = this.enabledMarkets().map((m) => m.id);
    return this.exchanges().filter((e) => enabledMarketIds.includes(e.marketId));
  });
  enabledExchanges = computed(() => this.exchanges().filter((e) => e.enabled));
  filteredDataSources = computed(() => {
    const enabledExchangeIds = this.enabledExchanges().map((e) => e.id);
    return this.dataSources().filter((ds) => {
      if (ds.type === 'exchange_api') {
        return ds.linkedExchangeId && enabledExchangeIds.includes(ds.linkedExchangeId);
      }
      return true; // Always show third-party and file upload
    });
  });
  enabledDataSources = computed(() => this.dataSources().filter((d) => d.enabled));

  private wizardService = inject(SetupWizardService);

  // UI state
  saving = this.wizardService.saving;
  animating = signal(false);
  slideDirection = signal<'left' | 'right'>('left');

  // Step labels
  steps = ['Welcome', 'Markets', 'Exchanges', 'Data Sources', 'Complete'];

  constructor() {}

  ngOnInit(): void {
    this.markets.set(this.wizardService.getDefaultMarkets());
    this.exchanges.set(this.wizardService.getDefaultExchanges());
    this.dataSources.set(this.wizardService.getDefaultDataSources());
  }

  // =============================================
  // NAVIGATION
  // =============================================

  next(): void {
    if (this.currentStep() < this.totalSteps - 1) {
      this.slideDirection.set('left');
      this.animating.set(true);
      setTimeout(() => {
        this.currentStep.update((s) => s + 1);
        this.animating.set(false);
      }, 200);
    }
  }

  back(): void {
    if (this.currentStep() > 0) {
      this.slideDirection.set('right');
      this.animating.set(true);
      setTimeout(() => {
        this.currentStep.update((s) => s - 1);
        this.animating.set(false);
      }, 200);
    }
  }

  goToStep(step: number): void {
    if (step >= 0 && step < this.totalSteps && step <= this.getMaxReachableStep()) {
      this.slideDirection.set(step > this.currentStep() ? 'left' : 'right');
      this.animating.set(true);
      setTimeout(() => {
        this.currentStep.set(step);
        this.animating.set(false);
      }, 200);
    }
  }

  getMaxReachableStep(): number {
    // Can always go to welcome. Other steps depend on prior selections.
    if (this.enabledMarkets().length === 0) return 1;
    if (this.enabledExchanges().length === 0) return 2;
    return this.totalSteps - 1;
  }

  canGoNext(): boolean {
    const step = this.currentStep();
    if (step === 0) return true; // Welcome
    if (step === 1) return this.enabledMarkets().length > 0;
    if (step === 2) return true; // Exchanges are optional per market
    if (step === 3) return true; // Data sources are optional
    return false;
  }

  // =============================================
  // TOGGLES
  // =============================================

  toggleMarket(market: WizardMarket): void {
    this.markets.update((list) =>
      list.map((m) => (m.id === market.id ? { ...m, enabled: !m.enabled } : m))
    );

    // If disabling a market, disable its exchanges and linked data sources
    if (market.enabled) {
      this.exchanges.update((list) =>
        list.map((e) => (e.marketId === market.id ? { ...e, enabled: false } : e))
      );
      const disabledExchangeIds = this.exchanges()
        .filter((e) => e.marketId === market.id)
        .map((e) => e.id);
      this.dataSources.update((list) =>
        list.map((ds) =>
          ds.linkedExchangeId && disabledExchangeIds.includes(ds.linkedExchangeId)
            ? { ...ds, enabled: false }
            : ds
        )
      );
    }
  }

  toggleExchange(exchange: WizardExchange): void {
    this.exchanges.update((list) =>
      list.map((e) => (e.id === exchange.id ? { ...e, enabled: !e.enabled } : e))
    );

    // Auto-enable/disable linked data source
    this.dataSources.update((list) =>
      list.map((ds) =>
        ds.linkedExchangeId === exchange.id
          ? { ...ds, enabled: !exchange.enabled }
          : ds
      )
    );
  }

  toggleDataSource(ds: WizardDataSource): void {
    this.dataSources.update((list) =>
      list.map((d) => (d.id === ds.id ? { ...d, enabled: !d.enabled } : d))
    );
  }

  selectAllExchanges(marketId: string): void {
    const allEnabled = this.filteredExchanges()
      .filter((e) => e.marketId === marketId)
      .every((e) => e.enabled);

    this.exchanges.update((list) =>
      list.map((e) => (e.marketId === marketId ? { ...e, enabled: !allEnabled } : e))
    );

    // Update linked data sources
    const exchangeIds = this.exchanges()
      .filter((e) => e.marketId === marketId)
      .map((e) => e.id);
    this.dataSources.update((list) =>
      list.map((ds) =>
        ds.linkedExchangeId && exchangeIds.includes(ds.linkedExchangeId)
          ? { ...ds, enabled: !allEnabled }
          : ds
      )
    );
  }

  // =============================================
  // GROUPED EXCHANGES
  // =============================================

  getExchangesByMarket(): { market: WizardMarket; exchanges: WizardExchange[] }[] {
    return this.enabledMarkets().map((market) => ({
      market,
      exchanges: this.filteredExchanges().filter((e) => e.marketId === market.id),
    }));
  }

  getDataSourcesByType(): { type: string; label: string; sources: WizardDataSource[] }[] {
    const filtered = this.filteredDataSources();
    const groups: { type: string; label: string; sources: WizardDataSource[] }[] = [];

    const exchangeApi = filtered.filter((d) => d.type === 'exchange_api');
    if (exchangeApi.length) {
      groups.push({ type: 'exchange_api', label: 'Exchange APIs', sources: exchangeApi });
    }

    const thirdParty = filtered.filter((d) => d.type === 'third_party');
    if (thirdParty.length) {
      groups.push({ type: 'third_party', label: 'Third-Party Providers', sources: thirdParty });
    }

    const fileUpload = filtered.filter((d) => d.type === 'file_upload');
    if (fileUpload.length) {
      groups.push({ type: 'file_upload', label: 'File Upload', sources: fileUpload });
    }

    return groups;
  }

  // =============================================
  // ACTIONS
  // =============================================

  dismiss(): void {
    this.wizardService.dismiss();
    this.closed.emit();
  }

  /** Check if all exchanges for a given market are enabled (used in template) */
  allExchangesEnabled(marketId: string): boolean {
    return this.filteredExchanges()
      .filter((e) => e.marketId === marketId)
      .every((e) => e.enabled);
  }

  finish(): void {
    const state: WizardState = {
      currentStep: this.currentStep(),
      markets: this.markets(),
      exchanges: this.exchanges(),
      dataSources: this.dataSources(),
    };

    this.wizardService.saveSelections(state).subscribe({
      next: () => {
        this.wizardService.complete();
        this.closed.emit();
      },
      error: () => {
        // Still mark as complete even if save fails
        this.wizardService.complete();
        this.closed.emit();
      },
    });
  }

  // =============================================
  // HELPERS
  // =============================================

  getMarketIcon(iconName: string): string {
    const icons: Record<string, string> = {
      bitcoin:
        'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1.5 14.5h-1v1.5h-1v-1.5h-2v-1h.5a.5.5 0 0 0 .5-.5v-5a.5.5 0 0 0-.5-.5H9v-1h2V7h1v1.5h1a2.5 2.5 0 0 1 1.8 4.2 2.5 2.5 0 0 1-1.3 3.8z',
      'trending-up': 'M22 7l-8.5 8.5-5-5L2 17',
      globe:
        'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zM2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z',
      diamond: 'M2.7 10.3a2.41 2.41 0 0 0 0 3.41l7.59 7.59a2.41 2.41 0 0 0 3.41 0l7.59-7.59a2.41 2.41 0 0 0 0-3.41l-7.59-7.59a2.41 2.41 0 0 0-3.41 0z',
    };
    return icons[iconName] || icons['globe'];
  }

  getStepProgress(): number {
    return ((this.currentStep() + 1) / this.totalSteps) * 100;
  }
}
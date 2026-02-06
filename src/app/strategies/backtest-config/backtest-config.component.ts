import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StrategiesService } from '../../_services/strategies.service';
import { ToastService } from '../../_services/toast.service';
import {
  BacktestRequest,
  BacktestResult,
  DataCoverage,
  DataVerificationResult,
  DataVerificationRequest
} from '../../_models/strategy.model';

@Component({
  selector: 'backtest-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './backtest-config.component.html',
  styleUrls: ['./backtest-config.component.scss']
})
export class BacktestConfigComponent implements OnInit {
  @Input() strategyId!: number;
  @Input() symbol = '';
  @Input() dataSource = '';
  @Input() interval = '1h';
  @Output() completed = new EventEmitter<BacktestResult>();
  @Output() cancelled = new EventEmitter<void>();

  startDate = '';
  endDate = '';
  initialCapital = 10000;
  showOverrides = false;
  overrideSymbol = '';
  overrideSource = '';
  overrideInterval = '';

  coverage: DataCoverage | null = null;
  verification: DataVerificationResult | null = null;
  loading = false;
  verifying = false;
  running = false;

  constructor(
    private strategiesService: StrategiesService,
    private toastService: ToastService
  ) {}

  async ngOnInit() {
    this.loading = true;

    if (this.symbol && this.dataSource) {
      try {
        const res = await this.strategiesService.getDataCoverage(this.symbol);
        if (res?.responseCode === 200) {
          const coverages: DataCoverage[] = res.responseData || [];
          this.coverage = coverages.find(
            c => c.source === this.dataSource && c.interval === this.interval
          ) || null;

          if (this.coverage) {
            this.startDate = this.coverage.fromDate.substring(0, 10);
            this.endDate = this.coverage.toDate.substring(0, 10);
          }
        }
      } catch (err) {
        console.error('Failed to load coverage', err);
      }
    }

    this.loading = false;
  }

  // ── Computed ─────────────────────────────────────────────

  get effectiveSymbol(): string {
    return (this.showOverrides && this.overrideSymbol) || this.symbol;
  }

  get effectiveSource(): string {
    return (this.showOverrides && this.overrideSource) || this.dataSource;
  }

  get effectiveInterval(): string {
    return (this.showOverrides && this.overrideInterval) || this.interval;
  }

  isValid(): boolean {
    return !!this.startDate && !!this.endDate && this.initialCapital > 0;
  }

  canVerify(): boolean {
    return this.isValid() && !!this.effectiveSymbol && !!this.effectiveSource;
  }

  get verificationStatusClass(): string {
    if (!this.verification) return '';
    switch (this.verification.status) {
      case 'FullyCovered':     return 'verification-success';
      case 'PartialWithFetch':
      case 'FetchRequired':    return 'verification-info';
      case 'PartialCoverage':  return 'verification-warning';
      case 'NoData':           return 'verification-error';
      default: return '';
    }
  }

  get verificationIcon(): string {
    if (!this.verification) return '';
    switch (this.verification.status) {
      case 'FullyCovered':     return '✓';
      case 'PartialWithFetch':
      case 'FetchRequired':    return '↓';
      case 'PartialCoverage':  return '⚠';
      case 'NoData':           return '✗';
      default: return '';
    }
  }

  get canRunBacktest(): boolean {
    if (!this.isValid()) return false;
    if (!this.verification) return true;
    return this.verification.status !== 'NoData';
  }

  // ── Actions ──────────────────────────────────────────────

  onInputChange() {
    this.verification = null;
  }

  async verifyData() {
    if (!this.canVerify()) return;

    this.verifying = true;
    this.verification = null;

    const request: DataVerificationRequest = {
      symbol: this.effectiveSymbol,
      source: this.effectiveSource,
      interval: this.effectiveInterval,
      startDate: new Date(this.startDate).toISOString(),
      endDate: new Date(this.endDate).toISOString()
    };

    try {
      const res = await this.strategiesService.verifyData(request);
      if (res?.responseCode === 200) {
        this.verification = res.responseData;
      } else {
        this.toastService.showToast('Verification failed.', 'error');
      }
    } catch (err) {
      this.toastService.showToast('Could not verify data availability.', 'error');
      console.error(err);
    }

    this.verifying = false;
  }

  async runBacktest() {
    this.running = true;

    const request: BacktestRequest = {
      strategyId: this.strategyId,
      startDate: new Date(this.startDate).toISOString(),
      endDate: new Date(this.endDate).toISOString(),
      initialCapital: this.initialCapital,
      symbol: this.showOverrides && this.overrideSymbol ? this.overrideSymbol : undefined,
      dataSource: this.showOverrides && this.overrideSource ? this.overrideSource : undefined,
      interval: this.showOverrides && this.overrideInterval ? this.overrideInterval : undefined,
    };

    try {
      const res = await this.strategiesService.runBacktest(this.strategyId, request);
      if (res?.responseCode === 200) {
        this.toastService.showToast('Backtest completed.', 'success');
        this.completed.emit(res.responseData);
      } else {
        this.toastService.showToast(res?.responseMessage || 'Backtest failed.', 'error');
      }
    } catch (err) {
      this.toastService.showToast('Backtest execution failed.', 'error');
      console.error(err);
    }

    this.running = false;
  }
}
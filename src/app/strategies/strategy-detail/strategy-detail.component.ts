// FILE: egibi-ui/src/app/strategies/strategy-detail/strategy-detail.component.ts

import { Component, OnInit, TemplateRef, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { NgbModal, ModalDismissReasons } from '@ng-bootstrap/ng-bootstrap';
import { StrategiesService } from '../../_services/strategies.service';
import { ToastService } from '../../_services/toast.service';
import { Strategy, BacktestResult, BacktestSummary } from '../../_models/strategy.model';
import { StrategyBuilderComponent } from '../strategy-builder/strategy-builder.component';
import { BacktestConfigComponent } from '../backtest-config/backtest-config.component';
import { BacktestResultsComponent } from '../backtest-results/backtest-results.component';

@Component({
  selector: 'strategy-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    StrategyBuilderComponent,
    BacktestConfigComponent,
    BacktestResultsComponent
  ],
  templateUrl: './strategy-detail.component.html',
  styleUrl: './strategy-detail.component.scss'
})
export class StrategyDetailComponent implements OnInit {
  // ── State ──────────────────────────────────────────────
  strategyId: number | null = null;
  strategy: Strategy | null = null;
  isNewStrategy = false;
  loading = true;

  // ── Active View ────────────────────────────────────────
  activeTab: 'builder' | 'backtests' = 'builder';

  // ── Backtest State ─────────────────────────────────────
  backtestHistory: BacktestSummary[] = [];
  backtestResult: BacktestResult | null = null;
  showBacktestConfig = false;
  loadingBacktests = false;

  private modalService = inject(NgbModal);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private strategiesService: StrategiesService,
    private toastService: ToastService
  ) {}

  async ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');

    if (idParam === 'new') {
      this.isNewStrategy = true;
      this.loading = false;
      return;
    }

    this.strategyId = Number(idParam);
    if (isNaN(this.strategyId)) {
      this.router.navigate(['/strategies']);
      return;
    }

    await this.loadStrategy();
    await this.loadBacktestHistory();
    this.loading = false;
  }


  // ═══════════════════════════════════════════════════════
  //  DATA LOADING
  // ═══════════════════════════════════════════════════════

  private async loadStrategy() {
    try {
      const res = await this.strategiesService.getById(this.strategyId!);
      if (res?.responseCode === 200) {
        this.strategy = res.responseData;
      } else {
        this.toastService.showToast('Strategy not found.', 'error');
        this.router.navigate(['/strategies']);
      }
    } catch (err) {
      console.error('Failed to load strategy', err);
      this.toastService.showToast('Failed to load strategy.', 'error');
      this.router.navigate(['/strategies']);
    }
  }

  private async loadBacktestHistory() {
    if (!this.strategyId) return;
    this.loadingBacktests = true;

    try {
      const res = await this.strategiesService.getBacktests(this.strategyId);
      if (res?.responseCode === 200) {
        this.backtestHistory = res.responseData || [];
      }
    } catch (err) {
      console.error('Failed to load backtests', err);
    }

    this.loadingBacktests = false;
  }


  // ═══════════════════════════════════════════════════════
  //  STRATEGY BUILDER EVENTS
  // ═══════════════════════════════════════════════════════

  onStrategySaved(newId: number) {
    if (this.isNewStrategy) {
      // Navigate to the newly created strategy
      this.router.navigate(['/strategies', newId]);
    } else {
      // Reload strategy data
      this.loadStrategy();
    }
  }

  onStrategyCancelled() {
    this.router.navigate(['/strategies']);
  }


  // ═══════════════════════════════════════════════════════
  //  BACKTEST ACTIONS
  // ═══════════════════════════════════════════════════════

  startNewBacktest() {
    this.backtestResult = null;
    this.showBacktestConfig = true;
  }

  onBacktestCompleted(result: BacktestResult) {
    this.backtestResult = result;
    this.showBacktestConfig = false;
    this.loadBacktestHistory(); // Refresh the history list
  }

  onBacktestCancelled() {
    this.showBacktestConfig = false;
  }

  async viewBacktestDetail(backtestId: number) {
    try {
      const res = await this.strategiesService.getBacktestDetail(backtestId);
      if (res?.responseCode === 200 && res.responseData) {
        this.backtestResult = res.responseData;
        this.showBacktestConfig = false;
      } else {
        this.toastService.showToast('Could not load backtest details.', 'error');
      }
    } catch (err) {
      console.error('Failed to load backtest detail', err);
      this.toastService.showToast('Failed to load backtest details.', 'error');
    }
  }


  // ═══════════════════════════════════════════════════════
  //  DELETE
  // ═══════════════════════════════════════════════════════

  openDeleteModal(content: TemplateRef<any>) {
    this.modalService.open(content).result.then(
      (result) => {
        if (result === 'delete-confirm') {
          this.deleteStrategy();
        }
      },
      () => {}
    );
  }

  private async deleteStrategy() {
    if (!this.strategyId) return;

    try {
      await this.strategiesService.delete(this.strategyId);
      this.toastService.showToast('Strategy deleted.', 'success');
      this.router.navigate(['/strategies']);
    } catch (err) {
      console.error('Failed to delete strategy', err);
      this.toastService.showToast('Failed to delete strategy.', 'error');
    }
  }


  // ═══════════════════════════════════════════════════════
  //  HELPERS
  // ═══════════════════════════════════════════════════════

  getReturnClass(value: number | null | undefined): string {
    if (value == null) return '';
    if (value > 0) return 'stat-positive';
    if (value < 0) return 'stat-negative';
    return '';
  }

  formatReturn(value: number | null | undefined): string {
    if (value == null) return '—';
    return (value > 0 ? '+' : '') + value.toFixed(2) + '%';
  }
}
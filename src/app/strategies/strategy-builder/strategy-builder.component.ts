import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { StrategiesService } from '../../_services/strategies.service';
import { AccountsService } from '../../accounts/accounts.service';
import { ToastService } from '../../_services/toast.service';
import {
  StrategyConfiguration,
  StrategyCondition,
  CreateStrategyRequest,
  DataCoverage,
  AVAILABLE_INDICATORS,
  AVAILABLE_OPERATORS,
  AVAILABLE_INTERVALS
} from '../../_models/strategy.model';

@Component({
  selector: 'strategy-builder',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './strategy-builder.component.html',
  styleUrl: './strategy-builder.component.scss'
})
export class StrategyBuilderComponent implements OnInit {
  @Input() strategyId: number | null = null;  // null = create, number = edit
  @Output() saved = new EventEmitter<number>();
  @Output() cancelled = new EventEmitter<void>();

  // ── Form State ───────────────────────────────────────────
  name = '';
  description = '';

  config: StrategyConfiguration = {
    accountId: undefined,
    symbol: '',
    interval: '1h',
    dataSource: '',
    entryConditions: [],
    entryLogic: 'AND',
    exitConditions: [],
    exitLogic: 'AND',
    positionSizePct: 100,
    allowShort: false,
    stopLossPct: undefined,
    takeProfitPct: undefined
  };

  // ── Dropdown Data ────────────────────────────────────────
  accounts: any[] = [];
  availableSymbols: string[] = [];
  dataCoverage: DataCoverage[] = [];
  filteredSources: DataCoverage[] = [];

  // ── Reference Data ───────────────────────────────────────
  indicators = AVAILABLE_INDICATORS;
  operators = AVAILABLE_OPERATORS;
  intervals = AVAILABLE_INTERVALS;

  // ── UI State ─────────────────────────────────────────────
  loading = false;
  saving = false;
  activeTab: 'rules' | 'risk' | 'data' = 'data';

  constructor(
    private strategiesService: StrategiesService,
    private accountsService: AccountsService,
    private toastService: ToastService
  ) {}

  async ngOnInit() {
    this.loading = true;

    // Load accounts (non-critical — backtest-only strategies don't need one)
    try {
      const accountsRes: any = await new Promise((resolve, reject) => {
        this.accountsService.getAccounts().subscribe({
          next: (res) => resolve(res),
          error: (err) => reject(err)
        });
      });
      if (accountsRes?.responseCode === 200) {
        this.accounts = accountsRes.responseData || [];
      }
    } catch (err) {
      console.warn('Could not load accounts:', err);
    }

    // Load available symbols from QuestDB (non-critical — user can type manually)
    try {
      const symbolsRes = await this.strategiesService.getAvailableSymbols();
      if (symbolsRes?.responseCode === 200) {
        this.availableSymbols = symbolsRes.responseData || [];
      }
    } catch (err) {
      console.warn('Could not load available symbols:', err);
    }

    // Load full data coverage (non-critical — used for dropdowns)
    try {
      const coverageRes = await this.strategiesService.getDataCoverage();
      if (coverageRes?.responseCode === 200) {
        this.dataCoverage = coverageRes.responseData || [];
      }
    } catch (err) {
      console.warn('Could not load data coverage:', err);
    }

    // If editing, load existing strategy (critical for edit mode)
    if (this.strategyId) {
      try {
        const stratRes = await this.strategiesService.getById(this.strategyId);
        if (stratRes?.responseCode === 200) {
          const data = stratRes.responseData;
          this.name = data.name;
          this.description = data.description || '';
          if (data.configuration) {
            this.config = { ...this.config, ...data.configuration };
          }
          this.onSymbolChange(); // Refresh filtered sources
        } else {
          this.toastService.showToast('Strategy not found.', 'error');
        }
      } catch (err) {
        this.toastService.showToast('Failed to load strategy.', 'error');
        console.error(err);
      }
    } else {
      // Default: add one empty entry and exit condition
      this.addCondition('entry');
      this.addCondition('exit');
    }

    this.loading = false;
  }


  // ═══════════════════════════════════════════════════════════
  //  CONDITION MANAGEMENT
  // ═══════════════════════════════════════════════════════════

  addCondition(type: 'entry' | 'exit') {
    const condition: StrategyCondition = {
      indicator: 'SMA',
      period: 20,
      operator: 'CROSSES_ABOVE',
      compareType: 'INDICATOR',
      compareIndicator: 'SMA',
      comparePeriod: 50,
      compareValue: undefined
    };

    if (type === 'entry') {
      this.config.entryConditions.push(condition);
    } else {
      this.config.exitConditions.push(condition);
    }
  }

  removeCondition(type: 'entry' | 'exit', index: number) {
    if (type === 'entry') {
      this.config.entryConditions.splice(index, 1);
    } else {
      this.config.exitConditions.splice(index, 1);
    }
  }

  onIndicatorChange(condition: StrategyCondition) {
    const meta = this.indicators.find(i => i.value === condition.indicator);
    if (meta) {
      condition.period = meta.defaultPeriod;
    }
  }

  onCompareTypeChange(condition: StrategyCondition) {
    if (condition.compareType === 'VALUE') {
      condition.compareIndicator = undefined;
      condition.comparePeriod = undefined;
      condition.compareValue = 0;
    } else {
      condition.compareValue = undefined;
      condition.compareIndicator = 'SMA';
      condition.comparePeriod = 50;
    }
  }

  indicatorHasParameter(indicator: string): boolean {
    return this.indicators.find(i => i.value === indicator)?.hasParameter ?? false;
  }


  // ═══════════════════════════════════════════════════════════
  //  DATA SOURCE FILTERING
  // ═══════════════════════════════════════════════════════════

  onSymbolChange() {
    if (this.config.symbol) {
      this.filteredSources = this.dataCoverage.filter(
        d => d.symbol === this.config.symbol
      );
    } else {
      this.filteredSources = [];
    }

    // Reset source if it doesn't match the new symbol
    if (this.config.dataSource) {
      const validSource = this.filteredSources.find(
        s => s.source === this.config.dataSource && s.interval === this.config.interval
      );
      if (!validSource) {
        this.config.dataSource = '';
      }
    }
  }

  getUniqueSourcesForSymbol(): { source: string; intervals: DataCoverage[] }[] {
    const map = new Map<string, DataCoverage[]>();
    for (const item of this.filteredSources) {
      if (!map.has(item.source)) map.set(item.source, []);
      map.get(item.source)!.push(item);
    }
    return Array.from(map.entries()).map(([source, intervals]) => ({ source, intervals }));
  }

  getSelectedCoverage(): DataCoverage | null {
    return this.filteredSources.find(
      s => s.source === this.config.dataSource && s.interval === this.config.interval
    ) || null;
  }


  // ═══════════════════════════════════════════════════════════
  //  SAVE
  // ═══════════════════════════════════════════════════════════

  async save() {
    if (!this.name.trim()) {
      this.toastService.showToast('Strategy name is required.', 'warning');
      return;
    }

    if (this.config.entryConditions.length === 0) {
      this.toastService.showToast('At least one entry condition is required.', 'warning');
      return;
    }

    if (this.config.exitConditions.length === 0) {
      this.toastService.showToast('At least one exit condition is required.', 'warning');
      return;
    }

    this.saving = true;

    const request: CreateStrategyRequest = {
      name: this.name.trim(),
      description: this.description.trim() || undefined,
      configuration: this.config
    };

    try {
      let result: any;
      if (this.strategyId) {
        result = await this.strategiesService.update(this.strategyId, request);
      } else {
        result = await this.strategiesService.create(request);
      }

      if (result?.responseCode === 200) {
        this.toastService.showToast(
          this.strategyId ? 'Strategy updated.' : 'Strategy created.',
          'success'
        );
        this.saved.emit(result.responseData?.id || this.strategyId!);
      } else {
        this.toastService.showToast(result?.responseMessage || 'Save failed.', 'error');
      }
    } catch (err) {
      this.toastService.showToast('Failed to save strategy.', 'error');
      console.error(err);
    }

    this.saving = false;
  }

  cancel() {
    this.cancelled.emit();
  }
}
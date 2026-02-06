// ═══════════════════════════════════════════════════════════
//  STRATEGY MODELS
// ═══════════════════════════════════════════════════════════

export interface StrategyConfiguration {
  exchangeAccountId?: number;
  symbol: string;
  interval: string;
  dataSource: string;

  entryConditions: StrategyCondition[];
  entryLogic: 'AND' | 'OR';

  exitConditions: StrategyCondition[];
  exitLogic: 'AND' | 'OR';

  positionSizePct: number;
  allowShort: boolean;

  stopLossPct?: number;
  takeProfitPct?: number;
}

export interface StrategyCondition {
  indicator: string;
  period: number;
  operator: string;
  compareType: 'VALUE' | 'INDICATOR';
  compareValue?: number;
  compareIndicator?: string;
  comparePeriod?: number;
}

export interface Strategy {
  id: number;
  name: string;
  description?: string;
  isSimple: boolean;
  isActive: boolean;
  exchangeAccountId?: number;
  exchangeName?: string;
  strategyClassName?: string;
  createdAt: string;
  updatedAt?: string;
  backtestCount: number;
  configuration?: StrategyConfiguration;
}

export interface CreateStrategyRequest {
  name: string;
  description?: string;
  configuration?: StrategyConfiguration;
}


// ═══════════════════════════════════════════════════════════
//  BACKTEST MODELS
// ═══════════════════════════════════════════════════════════

export interface BacktestRequest {
  strategyId: number;
  startDate: string;
  endDate: string;
  initialCapital: number;
  symbol?: string;
  dataSource?: string;
  interval?: string;
}

export interface BacktestResult {
  initialCapital: number;
  finalCapital: number;
  totalReturnPct: number;
  maxDrawdownPct: number;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  profitFactor: number;
  sharpeRatio: number;
  averageWinPct: number;
  averageLossPct: number;
  largestWinPct: number;
  largestLossPct: number;
  averageHoldTime: string;

  symbol: string;
  dataSource: string;
  interval: string;
  startDate: string;
  endDate: string;
  candlesProcessed: number;

  equityCurve: EquityPoint[];
  trades: BacktestTrade[];

  executionTimeMs: number;
  warnings: string[];
}

export interface EquityPoint {
  timestamp: string;
  equity: number;
  drawdownPct: number;
}

export interface BacktestTrade {
  tradeNumber: number;
  side: string;
  entryTime: string;
  entryPrice: number;
  exitTime: string;
  exitPrice: number;
  quantity: number;
  pnL: number;
  pnLPct: number;
  equityAfter: number;
  exitReason: string;
  holdDuration: string;
}

export interface BacktestSummary {
  id: number;
  name: string;
  status: string;
  startDate: string;
  endDate: string;
  initialCapital: number;
  finalCapital?: number;
  totalReturnPct?: number;
  totalTrades?: number;
  winRate?: number;
  maxDrawdownPct?: number;
  sharpeRatio?: number;
  executedAt?: string;
}


// ═══════════════════════════════════════════════════════════
//  DATA COVERAGE
// ═══════════════════════════════════════════════════════════

export interface DataCoverage {
  symbol: string;
  source: string;
  interval: string;
  fromDate: string;
  toDate: string;
  candleCount: number;
}

export type DataVerificationStatus =
  | 'FullyCovered'
  | 'PartialWithFetch'
  | 'PartialCoverage'
  | 'FetchRequired'
  | 'NoData';

export interface DataVerificationResult {
  symbol: string;
  source: string;
  interval: string;
  requestedFrom: string;
  requestedTo: string;
  status: DataVerificationStatus;
  message: string;
  canAutoFetch: boolean;
  storedCandleCount: number;
  storedFrom?: string;
  storedTo?: string;
  expectedCandleCount: number;
}

export interface DataVerificationRequest {
  symbol: string;
  source: string;
  interval: string;
  startDate: string;
  endDate: string;
}


// ═══════════════════════════════════════════════════════════
//  INDICATOR METADATA (for UI dropdowns)
// ═══════════════════════════════════════════════════════════

export const AVAILABLE_INDICATORS = [
  { value: 'PRICE', label: 'Price', hasParameter: false, defaultPeriod: 0 },
  { value: 'SMA', label: 'Simple Moving Average (SMA)', hasParameter: true, defaultPeriod: 20 },
  { value: 'EMA', label: 'Exponential Moving Average (EMA)', hasParameter: true, defaultPeriod: 20 },
  { value: 'RSI', label: 'Relative Strength Index (RSI)', hasParameter: true, defaultPeriod: 14 },
  { value: 'MACD', label: 'MACD Line', hasParameter: false, defaultPeriod: 0 },
  { value: 'MACD_SIGNAL', label: 'MACD Signal Line', hasParameter: false, defaultPeriod: 0 },
  { value: 'MACD_HIST', label: 'MACD Histogram', hasParameter: false, defaultPeriod: 0 },
  { value: 'BBANDS_UPPER', label: 'Bollinger Upper Band', hasParameter: true, defaultPeriod: 20 },
  { value: 'BBANDS_MIDDLE', label: 'Bollinger Middle Band', hasParameter: true, defaultPeriod: 20 },
  { value: 'BBANDS_LOWER', label: 'Bollinger Lower Band', hasParameter: true, defaultPeriod: 20 },
];

export const AVAILABLE_OPERATORS = [
  { value: 'GREATER_THAN', label: 'is greater than' },
  { value: 'LESS_THAN', label: 'is less than' },
  { value: 'CROSSES_ABOVE', label: 'crosses above' },
  { value: 'CROSSES_BELOW', label: 'crosses below' },
  { value: 'EQUALS', label: 'equals' },
];

export const AVAILABLE_INTERVALS = [
  { value: '1m', label: '1 Minute' },
  { value: '5m', label: '5 Minutes' },
  { value: '15m', label: '15 Minutes' },
  { value: '1h', label: '1 Hour' },
  { value: '4h', label: '4 Hours' },
  { value: '1d', label: '1 Day' },
  { value: '1w', label: '1 Week' },
];
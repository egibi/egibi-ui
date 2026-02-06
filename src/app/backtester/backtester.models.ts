export interface Backtest {
  id?: number;
  name: string;
  description: string;
  start: string;
  end: string;
  strategyId: number | null;
  strategyName?: string;
  status: BacktestStatus;
  synced?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export enum BacktestStatus {
  Draft = 'Draft',
  Ready = 'Ready',
  Running = 'Running',
  Completed = 'Completed',
  Failed = 'Failed',
  Cancelled = 'Cancelled'
}

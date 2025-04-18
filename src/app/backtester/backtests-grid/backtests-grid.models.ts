import { Backtest } from "../backtester.models";

export class BacktestsGridItem{
  backtestID: string;
  name: string;
  description: string;
  synced: boolean;
  start: Date;
  end: Date;
  status: string;
}

export class BacktestsGridAction {
  name: string;
  backtest: Backtest;
}

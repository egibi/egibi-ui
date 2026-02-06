import { Backtest } from "../backtester.models";

export interface BacktestsGridAction {
  name: string;
  backtest: Backtest;
}

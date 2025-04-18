import { Injectable, signal } from "@angular/core";
import { Backtest } from "../backtester.models";

@Injectable({
  providedIn: "root",
})
export class BacktestsGridService {
  currentAction = signal<string>("");
  constructor() {}

  setCurrentAction(action: string) {
    this.currentAction.update(() => action);
  }

  getCurrentAction(): string {
    return this.currentAction();
  }

  setCurrentGridRows(backtests: Backtest[]) {}

  getCurrentGridRows(): Backtest[] {
    return [];
  }
}

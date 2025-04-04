import { Injectable, signal } from "@angular/core";
import { Strategy } from "../../_models/strategy.model";

@Injectable({
  providedIn: "root",
})
export class StrategiesGridService {
  currentAction = signal<string>("");
  constructor() {}

  setCurrentAction(action: string) {
    this.currentAction.update(() => action);
  }

  getCurrentAction(): string {
    return this.currentAction();
  }

  setCurrentGridRows(connections: Strategy[]) {}

  getCurrentGridRows(): Strategy[] {
    return [];
  }
}

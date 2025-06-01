import { Injectable, signal } from "@angular/core";
import { DataProvider } from "../../../_models/data-provider.model";
@Injectable({
  providedIn: 'root'
})
export class DataProvidersGridService {
  currentAction = signal<string>("");

  constructor() {}

  setCurrentAction(action: string) {
    this.currentAction.update(() => action);
  }

  getCurrentAction(): string {
    return this.currentAction();
  }

  setCurrentGridRows(dataProviders: DataProvider[]) {}

  getCurrentGridRows(): DataProvider[] {
    return [];
  }
}

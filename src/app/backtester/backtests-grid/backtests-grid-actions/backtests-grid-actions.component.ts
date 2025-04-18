import { Component, Input } from "@angular/core";
import { BacktestsGridService } from "../backtests-grid.service";
import { ICellRendererParams } from "ag-grid-community";

@Component({
  selector: "backtests-grid-actions",
  imports: [],
  templateUrl: "./backtests-grid-actions.component.html",
  styleUrl: "./backtests-grid-actions.component.scss",
})
export class BacktestsGridActionsComponent {
  @Input() actions: any[] = [];

  cellValue: any;

  agInit(params: ICellRendererParams): void {
    this.cellValue = params;
  }

  refresh(params: ICellRendererParams): void {
    this.cellValue = params.value;
  }

  constructor(private backtestsGridService: BacktestsGridService) {}

  public actionButtonClicked(action:string){
    this.backtestsGridService.setCurrentAction(action);
  }
}

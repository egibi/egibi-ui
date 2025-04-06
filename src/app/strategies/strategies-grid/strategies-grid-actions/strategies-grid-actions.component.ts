import { Component, Input } from "@angular/core";
import { StrategiesGridService } from "../strategies-grid.service";
import { ICellRendererParams } from "ag-grid-community";

@Component({
  selector: "strategies-grid-actions",
  standalone: true,
  imports: [],
  templateUrl: "./strategies-grid-actions.component.html",
  styleUrl: "./strategies-grid-actions.component.scss",
})
export class StrategiesGridActionsComponent {
  @Input() actions: any[] = [];

  cellValue: any;

  agInit(params: ICellRendererParams): void {
    this.cellValue = params;
  }

  refresh(params: ICellRendererParams): void {
    this.cellValue = params.value;
  }

  constructor(private strategiesGridService: StrategiesGridService) {}

  public actionButtonClicked(action: string) {
    this.strategiesGridService.setCurrentAction(action);
  }
}

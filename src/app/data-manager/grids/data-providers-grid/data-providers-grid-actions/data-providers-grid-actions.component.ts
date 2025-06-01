import { Component, Input } from "@angular/core";
import { DataProvidersGridService } from "../data-providers-grid.service";
import { ICellRendererParams } from "ag-grid-community";

@Component({
  selector: "data-providers-grid-actions",
  standalone: true,
  imports: [],
  templateUrl: "./data-providers-grid-actions.component.html",
  styleUrl: "./data-providers-grid-actions.component.scss",
})
export class DataProvidersGridActionsComponent {
  @Input() actions: any[] = [];

  cellValue: any;

  agInit(params: ICellRendererParams): void {
    this.cellValue = params;
  }

  refresh(params: ICellRendererParams): void {
    this.cellValue = params.value;
  }

  constructor(private dataProvidersGridService: DataProvidersGridService) {}

  public actionButtonClicked(action: string) {
    this.dataProvidersGridService.setCurrentAction(action);
  }
}

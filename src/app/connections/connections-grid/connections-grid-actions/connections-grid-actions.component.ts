import { Component, Input } from "@angular/core";
import { ConnectionsGridService } from "../connections-grid.service";
import { ICellRendererParams } from "ag-grid-community";

@Component({
  selector: "grid-action-button",
  standalone: true,
  imports: [],
  templateUrl: "./connections-grid-actions.component.html",
  styleUrl: "./connections-grid-actions.component.scss",
})
export class ConnectionsGridActionsComponent {
  @Input() actions: any[] = [];

  cellValue: any;

  agInit(params: ICellRendererParams): void {
    this.cellValue = params;
  }

  refresh(params: ICellRendererParams): void {
    this.cellValue = params.value;
  }

  constructor(private connectionsGridService: ConnectionsGridService) {}

  public actionButtonClicked(action: string) {
    this.connectionsGridService.setCurrentAction(action);
  }
}

import { Component, Input, Output, OnInit, EventEmitter, signal } from "@angular/core";
import { Strategy } from "../../_models/strategy.model";
import { AgGridModule } from "ag-grid-angular";
import {
  ColDef,
  GridReadyEvent,
  Module,
  themeQuartz,
  colorSchemeDark,
  GridApi,
  GetRowIdFunc,
  GetRowIdParams,
  SelectionChangedEvent,
  ClientSideRowModelModule,
  RowSelectionOptions,
  RowSelectionModule,
  ModuleRegistry,
  CellClickedEvent,
} from "ag-grid-community";
// import { ConnectionsGridActionsComponent } from "./connections-grid-actions/connections-grid-actions.component";
// import { ConnectionsGridService } from "./connections-grid.service";
// import { ConnectionsGridAction } from "./connections-grid.models";

import { StrategiesGridActionsComponent } from "./strategies-grid-actions/strategies-grid-actions.component";
import { StrategiesGridService } from "./strategies-grid.service";
import { StrategiesGridAction } from "./strategies-grid.models";

@Component({
  selector: "strategies-grid",
  imports: [AgGridModule],
  templateUrl: "./strategies-grid.component.html",
  styleUrl: "./strategies-grid.component.scss",
})
export class StrategiesGridComponent implements OnInit {
  @Input() strategies: Strategy[];
  @Output() actionSelect = new EventEmitter<StrategiesGridAction>();

  public gridApi: GridApi<Strategy>;
  public selectedRow: Strategy;
  public selectedRows: Strategy[] = [];
  public modules: Module[] = [ClientSideRowModelModule];
  public gridTheme = themeQuartz.withPart(colorSchemeDark); //TODO: globalize theme related stuff

  components = {
    gridActionsComponent: StrategiesGridActionsComponent,
  };

  public rowData: Strategy[] = [];

  constructor(private gridService: StrategiesGridService) {}

  public getRowId: GetRowIdFunc = (row: GetRowIdParams<Strategy>) => row.data.id?.toString();

  public rowSelection: RowSelectionOptions | "single" | "multiple" = {
    mode: "multiRow",
  };

  public columnDefs: ColDef[] = [
    {
      headerName: "Name",
      field: "name",
    },
    {
      headerName: "Description",
      field: "description",
    },
    {
      headerName: "Instance Name",
      field: "instanceName",
    },
    {
      headerName: "Actions",
      field: "actions",
      cellRenderer: StrategiesGridActionsComponent,
      onCellClicked: (event: CellClickedEvent) => {
        this.gridAction(event.data);
      }
    },
  ];

  public defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  public ngOnInit(): void {
    this.rowData = this.strategies;
  }

  public onGridReady(grid: GridReadyEvent<Strategy>) {
    this.gridApi = grid.api;
  }

  public onSelectionChanged(event: SelectionChangedEvent) {
    this.selectedRows = this.gridApi.getSelectedRows();

    if (this.selectedRows && this.selectedRows.length > 0) {
      this.selectedRow = this.selectedRows[0];
    }
  }

  public gridAction(rowData: Strategy): void {
    let action = this.gridService.getCurrentAction();
    let selectedAction: StrategiesGridAction = { name: action, strategy: rowData };
    this.actionSelect.emit(selectedAction);
  }
}

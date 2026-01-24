import { Component, Input, Output, OnInit, EventEmitter, inject } from "@angular/core";
import { Strategy } from "../../_models/strategy.model";
import { AgGridModule } from "ag-grid-angular";
import {
  ColDef,
  GridReadyEvent,
  Module,
  GridApi,
  GetRowIdFunc,
  GetRowIdParams,
  SelectionChangedEvent,
  ClientSideRowModelModule,
  RowSelectionOptions,
  CellClickedEvent,
} from "ag-grid-community";

import { StrategiesGridActionsComponent } from "./strategies-grid-actions/strategies-grid-actions.component";
import { StrategiesGridService } from "./strategies-grid.service";
import { StrategiesGridAction } from "./strategies-grid.models";
import { AgGridThemeService } from "../../_services/ag-grid-theme.service";

@Component({
  selector: "strategies-grid",
  standalone: true,
  imports: [AgGridModule],
  templateUrl: "./strategies-grid.component.html",
  styleUrl: "./strategies-grid.component.scss",
})
export class StrategiesGridComponent implements OnInit {
  @Input() strategies: Strategy[];
  @Output() actionSelect = new EventEmitter<StrategiesGridAction>();

  private agGridTheme = inject(AgGridThemeService);
  
  public gridApi: GridApi<Strategy>;
  public selectedRow: Strategy;
  public selectedRows: Strategy[] = [];
  public modules: Module[] = [ClientSideRowModelModule];
  
  // Use the theme service's computed signal
  public gridTheme = this.agGridTheme.theme;

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
      sortable: false,
      filter: false,
      onCellClicked: (event: CellClickedEvent) => {
        this.gridAction(event.data);
      }
    },
  ];

  public defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
    minWidth: 100,
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

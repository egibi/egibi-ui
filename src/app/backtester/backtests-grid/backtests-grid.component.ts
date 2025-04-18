import { Component, Input, Output, OnInit, EventEmitter, signal, input } from "@angular/core";
import { Backtest } from "../backtester.models";
import { BacktestsGridAction } from "./backtests-grid.models";
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

import { BacktestsGridActionsComponent } from "./backtests-grid-actions/backtests-grid-actions.component";
import { BacktestsGridService } from "./backtests-grid.service";

@Component({
  selector: "backtests-grid",
  imports: [AgGridModule],
  templateUrl: "./backtests-grid.component.html",
  styleUrl: "./backtests-grid.component.scss",
})
export class BacktestsGridComponent implements OnInit {
  @Input() backtests: Backtest[];
  @Output() actionSelect = new EventEmitter<BacktestsGridAction>();

  public gridApi: GridApi<Backtest>;
  public selectedRow: Backtest;
  public selectedRows: Backtest[] = [];
  public modules: Module[] = [ClientSideRowModelModule];
  public gridTheme = themeQuartz.withPart(colorSchemeDark); //TODO: globalize theme related stuff

  components = {
    gridActionsComponent: BacktestsGridActionsComponent,
  };

  public rowData: Backtest[] = [];

  constructor(private gridService: BacktestsGridService) {}

  public getRowId: GetRowIdFunc = (row: GetRowIdParams<Backtest>) => row.data.backtestID.toString();

  public rowSelection: RowSelectionOptions | "single" | "multiple" = {
    mode: "multiRow",
  };

  public columnDefs: ColDef[] = [
    {
      headerName: "Name",
      field: "name"
    },
    {
      headerName: "Description",
      field:"description",    
    },
    {
      headerName: "Start",
      field: "start"
    },
    {
      headerName: "End",
      field: "end"
    },
    {
      headerName: "Synced",
      field: "synced"
    },    
    {
      headerName: "Status",
      field: "status"
    },
    {
      headerName: "Actions",
      field: "actions",
      cellRenderer: BacktestsGridActionsComponent,
      onCellClicked: (event:CellClickedEvent) => {
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
    this.rowData = this.backtests;
  }

  public onGridReady(grid: GridReadyEvent<Backtest>) {
    this.gridApi = grid.api;
  }  

  public onSelectionChanged(event: SelectionChangedEvent) {
    this.selectedRows = this.gridApi.getSelectedRows();

    if (this.selectedRows && this.selectedRows.length > 0) {
      this.selectedRow = this.selectedRows[0];
    }
  }

  public gridAction(rowData: Backtest):void{
    let action = this.gridService.getCurrentAction();   
    let selectedAction: BacktestsGridAction = {name: action, backtest: rowData};
    this.actionSelect.emit(selectedAction);
  }  
}

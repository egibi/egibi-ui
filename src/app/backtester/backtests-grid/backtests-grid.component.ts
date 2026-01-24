import { Component, Input, Output, OnInit, EventEmitter, inject } from "@angular/core";
import { Backtest } from "../backtester.models";
import { BacktestsGridAction } from "./backtests-grid.models";
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

import { BacktestsGridActionsComponent } from "./backtests-grid-actions/backtests-grid-actions.component";
import { BacktesterService } from "../backtester.service";
import { AgGridThemeService } from "../../_services/ag-grid-theme.service";

@Component({
  selector: "backtests-grid",
  standalone: true,
  imports: [AgGridModule],
  templateUrl: "./backtests-grid.component.html",
  styleUrl: "./backtests-grid.component.scss",
})
export class BacktestsGridComponent implements OnInit {
  @Input() backtests: Backtest[];
  @Output() actionSelect = new EventEmitter<BacktestsGridAction>();

  private agGridTheme = inject(AgGridThemeService);

  public gridApi: GridApi<Backtest>;
  public selectedRow: Backtest;
  public selectedRows: Backtest[] = [];
  public modules: Module[] = [ClientSideRowModelModule];
  
  // Use the theme service's computed signal
  public gridTheme = this.agGridTheme.theme;

  components = {
    gridActionsComponent: BacktestsGridActionsComponent,
  };

  public rowData: Backtest[] = [];

  constructor(private backtesterService: BacktesterService) {}

  public getRowId: GetRowIdFunc = (row: GetRowIdParams<Backtest>) => row.data.id?.toString();

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
      field: "description",    
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

  public gridAction(rowData: Backtest): void {    
    let action = this.backtesterService.getCurrentBacktestsGridAction();
    let selectedAction: BacktestsGridAction = { name: action, backtest: rowData };
    this.actionSelect.emit(selectedAction);
  }  
}

import { Component, Input, Output, OnInit, EventEmitter, inject } from "@angular/core";
import { Backtest, BacktestStatus } from "../backtester.models";
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
  ICellRendererParams,
  PaginationModule,
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
  public modules: Module[] = [ClientSideRowModelModule, PaginationModule];

  public gridTheme = this.agGridTheme.theme;

  components = {
    gridActionsComponent: BacktestsGridActionsComponent,
  };

  public rowData: Backtest[] = [];

  constructor(private backtesterService: BacktesterService) {}

  public getRowId: GetRowIdFunc = (row: GetRowIdParams<Backtest>) => row.data.id?.toString() ?? '';

  public rowSelection: RowSelectionOptions | "single" | "multiple" = {
    mode: "multiRow",
  };

  public columnDefs: ColDef[] = [
    {
      headerName: "Name",
      field: "name",
      minWidth: 180,
    },
    {
      headerName: "Description",
      field: "description",
      minWidth: 200,
    },
    {
      headerName: "Strategy",
      field: "strategyName",
      minWidth: 150,
    },
    {
      headerName: "Start",
      field: "start",
      minWidth: 120,
      valueFormatter: (params) => this.formatDate(params.value),
    },
    {
      headerName: "End",
      field: "end",
      minWidth: 120,
      valueFormatter: (params) => this.formatDate(params.value),
    },
    {
      headerName: "Status",
      field: "status",
      minWidth: 100,
      cellRenderer: (params: ICellRendererParams) => {
        const status = params.value as BacktestStatus;
        const badgeClass = this.getStatusBadgeClass(status);
        return `<span class="badge ${badgeClass}">${status}</span>`;
      },
    },
    {
      headerName: "Actions",
      field: "actions",
      cellRenderer: BacktestsGridActionsComponent,
      sortable: false,
      filter: false,
      minWidth: 140,
      maxWidth: 160,
      onCellClicked: (event: CellClickedEvent) => {
        this.gridAction(event.data);
      },
    },
  ];

  public defaultColDef: ColDef = {
    sortable: true,
    filter: true,
    resizable: true,
    flex: 1,
    minWidth: 100,
  };

  // Pagination
  public pagination = true;
  public paginationPageSize = 20;
  public paginationPageSizeSelector = [10, 20, 50, 100];

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

  private formatDate(value: string): string {
    if (!value) return '';
    const d = new Date(value);
    if (isNaN(d.getTime())) return value;
    return d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
  }

  private getStatusBadgeClass(status: BacktestStatus): string {
    switch (status) {
      case BacktestStatus.Draft:
        return 'bg-secondary';
      case BacktestStatus.Ready:
        return 'bg-info';
      case BacktestStatus.Running:
        return 'bg-primary';
      case BacktestStatus.Completed:
        return 'bg-success';
      case BacktestStatus.Failed:
        return 'bg-danger';
      case BacktestStatus.Cancelled:
        return 'bg-warning text-dark';
      default:
        return 'bg-secondary';
    }
  }
}
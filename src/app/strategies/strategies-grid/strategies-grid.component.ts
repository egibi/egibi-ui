import { Component, Input, Output, OnInit, EventEmitter, inject } from "@angular/core";
import { Router } from "@angular/router";
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
  ValueFormatterParams,
  RowClickedEvent,
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
  private router = inject(Router);
  
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
      minWidth: 180,
    },
    {
      headerName: "Description",
      field: "description",
      minWidth: 200,
    },
    {
      headerName: "Exchange",
      field: "exchangeName",
      minWidth: 120,
      valueFormatter: (params: ValueFormatterParams) => params.value || '—',
    },
    {
      headerName: "Type",
      field: "isSimple",
      minWidth: 100,
      valueFormatter: (params: ValueFormatterParams) => params.value ? 'Rule-Based' : 'Code',
    },
    {
      headerName: "Backtests",
      field: "backtestCount",
      minWidth: 100,
      valueFormatter: (params: ValueFormatterParams) => params.value ?? 0,
    },
    {
      headerName: "Status",
      field: "isActive",
      minWidth: 90,
      cellRenderer: (params: any) => {
        const active = params.value;
        return active
          ? '<span style="background:hsla(142,71%,45%,0.12);color:hsl(142,71%,40%);padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;">ACTIVE</span>'
          : '<span style="background:hsla(0,0%,50%,0.1);color:hsl(0,0%,50%);padding:2px 8px;border-radius:4px;font-size:11px;font-weight:700;">INACTIVE</span>';
      },
    },
    {
      headerName: "Created",
      field: "createdAt",
      minWidth: 120,
      valueFormatter: (params: ValueFormatterParams) => {
        if (!params.value) return '';
        return new Date(params.value).toLocaleDateString();
      },
    },
    {
      headerName: "Actions",
      field: "actions",
      cellRenderer: StrategiesGridActionsComponent,
      sortable: false,
      filter: false,
      minWidth: 140,
      maxWidth: 160,
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

  public onCellClicked(event: CellClickedEvent<Strategy>) {
    // Don't navigate if clicking the actions column
    const column = event.colDef?.field as string;
    if (column === 'actions') return;

    if (event.data?.id) {
      this.router.navigate(['/strategies', event.data.id]);
    }
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
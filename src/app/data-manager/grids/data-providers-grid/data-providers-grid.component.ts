import { Component, Input, Output, OnInit, EventEmitter, inject } from "@angular/core";
import { DataProvider } from "../../../_models/data-provider.model";

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
  RowSelectionModule,
  ModuleRegistry,
  CellClickedEvent,
  RowClickedEvent,
} from "ag-grid-community";
import { DataProvidersGridAction } from "./data-providers-grid.models";
import { DataProvidersGridActionsComponent } from "./data-providers-grid-actions/data-providers-grid-actions.component";
import { DataProvidersGridService } from "./data-providers-grid.service";
import { AgGridThemeService } from "../../../_services/ag-grid-theme.service";

ModuleRegistry.registerModules([RowSelectionModule]);

@Component({
  selector: "data-providers-grid",
  standalone: true,
  imports: [AgGridModule],
  templateUrl: "./data-providers-grid.component.html",
  styleUrl: "./data-providers-grid.component.scss",
})
export class DataProvidersGridComponent implements OnInit {
  @Input() dataProviders: DataProvider[];
  @Input() dataProviderTypes: any[];
  @Output() actionSelect = new EventEmitter<DataProvidersGridAction>();
  @Output() rowSelect = new EventEmitter<number>();

  private agGridTheme = inject(AgGridThemeService);

  public gridApi: GridApi<any>;
  public selectedRow: any;
  public selectedRows: any[] = [];
  public modules: Module[] = [ClientSideRowModelModule];
  
  // Use the theme service's computed signal
  public gridTheme = this.agGridTheme.theme;

  components = {
    gridActionsComponent: DataProvidersGridActionsComponent,
  };

  @Input() rowData: DataProvider[] = [];

  constructor(private gridService: DataProvidersGridService) {}

  public getRowId: GetRowIdFunc = (row: GetRowIdParams<any>) => row.data.id?.toString();

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
      headerName: "Actions",
      field: "actions",
      cellRenderer: DataProvidersGridActionsComponent,
      sortable: false,
      filter: false,
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

  public ngOnInit(): void {
    this.rowData = this.dataProviders;
  }

  public onGridReady(grid: GridReadyEvent<any>) {
    this.gridApi = grid.api;
  }

  public onSelectionChanged(event: SelectionChangedEvent) {
    this.selectedRows = this.gridApi.getSelectedRows();

    if (this.selectedRows && this.selectedRows.length > 0) {
      this.selectedRow = this.selectedRows[0];
    }
  }

  public gridAction(rowData: DataProvider): void {
    let action = this.gridService.getCurrentAction();
    let selectedAction: DataProvidersGridAction = { name: action, dataProvider: rowData };
    this.actionSelect.emit(selectedAction);
  }
}

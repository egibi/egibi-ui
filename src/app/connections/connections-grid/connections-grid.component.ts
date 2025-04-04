import { Component, Input, Output, OnInit, EventEmitter, signal } from "@angular/core";
import { Connection } from "../../_models/connection.model";
import { ConnectionType } from "../../_models/connection-type.model";
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
import { ConnectionsGridActionsComponent } from "./connections-grid-actions/connections-grid-actions.component";
import { ConnectionsGridService } from "./connections-grid.service";
import { ConnectionsGridAction } from "./connections-grid.models";


ModuleRegistry.registerModules([RowSelectionModule]);

@Component({
  selector: "connections-grid",
  standalone: true,
  imports: [AgGridModule],
  templateUrl: "./connections-grid.component.html",
  styleUrl: "./connections-grid.component.scss",
})
export class ConnectionsGridComponent implements OnInit {
  @Input() connections: Connection[];
  @Input() connectionTypes: ConnectionType[];
  @Output() actionSelect = new EventEmitter<ConnectionsGridAction>();

  public gridApi: GridApi<Connection>;
  public selectedRow: Connection;
  public selectedRows: Connection[] = [];
  public modules: Module[] = [ClientSideRowModelModule];
  public gridTheme = themeQuartz.withPart(colorSchemeDark); //TODO: globalize theme related stuff

  components = {
    gridActionsComponent: ConnectionsGridActionsComponent,
  };


  public rowData: Connection[] = [];

  constructor(private gridService: ConnectionsGridService) {}

  public getRowId: GetRowIdFunc = (row: GetRowIdParams<Connection>) => row.data.connectionID.toString();

  public rowSelection: RowSelectionOptions | "single" | "multiple" = {
    mode: "multiRow",
  };

  public columnDefs: ColDef[] = [
    {
      headerName: "Name",
      field: "name",
    },
    {
      headerName:"Type",
      field: "connectionType",
      valueGetter: params => params.data.connectionType?.name
    },
    {
      headerName: "Description",
      field: "description",
    },
    {
      headerName: "Base URL",
      field: "baseUrl",
    },
    {
      headerName: "API Key",
      field: "apiKey",
    },
    {
      headerName: "API Secret Key",
      field: "apiSecretKey",
    },
    {
      headerName: "Data Source",
      field: "isDataSource",
      cellDataType: "text",
      valueFormatter: params => params.value ? "Yes" : "No"
    },
    {
      headerName: "Actions",
      field: "actions",
      cellRenderer: ConnectionsGridActionsComponent,
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
    this.rowData = this.connections;
  }

  public onGridReady(grid: GridReadyEvent<Connection>) {
    this.gridApi = grid.api;
  }

  public onSelectionChanged(event: SelectionChangedEvent) {
    this.selectedRows = this.gridApi.getSelectedRows();

    if (this.selectedRows && this.selectedRows.length > 0) {
      this.selectedRow = this.selectedRows[0];
    }
  }

  public gridAction(rowData: Connection):void{
    let action = this.gridService.getCurrentAction();   
    let selectedAction: ConnectionsGridAction = {name: action, connection: rowData};
    this.actionSelect.emit(selectedAction);
  }
}

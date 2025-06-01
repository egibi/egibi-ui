import { Component, Input, Output, OnInit, EventEmitter, signal } from "@angular/core";
// import { Connection } from "../../_models/connection.model";
// import { ConnectionType } from "../../_models/connection-type.model";
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
  RowClickedEvent
} from "ag-grid-community";
import { DataProvidersGridAction } from "./data-providers-grid.models";
import { DataProvidersGridActionsComponent } from "./data-providers-grid-actions/data-providers-grid-actions.component";
import { DataProvidersGridService } from "./data-providers-grid.service";

ModuleRegistry.registerModules([RowSelectionModule]);

@Component({
  selector: "data-providers-grid",
  imports: [AgGridModule],
  templateUrl: "./data-providers-grid.component.html",
  styleUrl: "./data-providers-grid.component.scss",
})
export class DataProvidersGridComponent {

  @Input() rowData: any[];
  @Input() dataProviderTypes: any[];
  @Output() actionSelect = new EventEmitter<DataProvidersGridAction>();
  @Output() rowSelect = new EventEmitter<number>();

  public gridApi: GridApi<any>;
  public selectedRow: any;
  public selectedRows: any[] = [];
  public modules: Module[] = [ClientSideRowModelModule];
  public gridTheme = themeQuartz.withPart(colorSchemeDark); //TODO: globalize theme related stuff

  components = {
    gridActionsComponent: DataProvidersGridActionsComponent,
  };

  constructor(private gridService: DataProvidersGridService) {}

  public getRowId: GetRowIdFunc = (row: GetRowIdParams<any>) => row.data.connectionId?.toString();

  public columnDefs: ColDef[] = [
    {
      headerName: "Name",
      field: "name",
    },
    {
      headerName: "Description",
      field: "description",
    },
  ];

  public defaultColDef = {
    sortable: true,
    filter: true,
    resizable: true,
  };

  public onGridReady(grid: GridReadyEvent<any>) {
    this.gridApi = grid.api;
  }

  public onSelectionChanged(event: SelectionChangedEvent) {
    this.selectedRows = this.gridApi.getSelectedRows();

    if (this.selectedRows && this.selectedRows.length > 0) {
      this.selectedRow = this.selectedRows[0];
    }
  }

  public onRowClicked(event:RowClickedEvent){
    console.log('on row clicked:::');
    console.log(event);

    this.rowSelect.emit(event.data.id);

    //this.router.navigate([`data-manager/data-provider/${id}`]);
  }
}

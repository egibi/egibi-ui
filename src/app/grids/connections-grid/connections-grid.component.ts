import { Component, Input } from "@angular/core";
import { Connection } from "../../models/connection.model";
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

@Component({
  selector: "connections-grid",
  imports: [],
  templateUrl: "./connections-grid.component.html",
  styleUrl: "./connections-grid.component.scss",
})
export class ConnectionsGridComponent {
  @Input() connections: Connection[];

  public gridApi: GridApi<Connection>;
  public selectedRow: Connection;
  public selectedRows: Connection[] = [];
  public modules: Module[] = [ClientSideRowModelModule];
  public gridTheme = themeQuartz.withPart(colorSchemeDark); //TODO: globalize theme related stuff
}

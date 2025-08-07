import { Component, Input, Output, EventEmitter } from "@angular/core";
import { EgibiTableColumn } from "./egibi-table.models";

@Component({
  selector: "egibi-table",
  standalone: true,
  imports: [],
  templateUrl: "./egibi-table.component.html",
  styleUrl: "./egibi-table.component.scss",
})
export class EgibiTableComponent {
  @Input() tableName: string;
  @Input() tableColumns: EgibiTableColumn[] = [];
  @Input() rowData: any[] = [];

  @Output() rowSelect = new EventEmitter<any>();

  onRowClick(rowData: any): void {
    this.rowSelect.emit(rowData);
  }
}

import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FileDropComponent } from "../../../_components/file-drop/file-drop.component";
import { DataManagerService } from "../../data-manager.service";
import { QuestDbTable, QuestDbDataType, QuestDbPartitionBy } from "../../../_models/questdb-table.model";

@Component({
  selector: "data-provider-file",
  standalone: true,
  imports: [FileDropComponent, CommonModule],
  templateUrl: "./data-provider-file.component.html",
  styleUrl: "./data-provider-file.component.scss",
})
export class DataProviderFileComponent {
  public fileHeaders: string[] = [];

  constructor(private dataManagerService: DataManagerService) {}

  public createQuestDbTable(): void {
    let table: QuestDbTable = new QuestDbTable();
    table.tableName = "thisIsATestTable";
    table.tablePartitionBy = QuestDbPartitionBy.none;
    table.tableColumns = [
      { columnName: "timestamp", dataType: QuestDbDataType.timestamp },
      { columnName: "test_col_01", dataType: QuestDbDataType.string },
      { columnName: "test_col_02", dataType: QuestDbDataType.string },
      { columnName: "test_col_03", dataType: QuestDbDataType.string },
    ];

    this.dataManagerService.createQuestDbTable(table).subscribe((res) => {
      console.log("creating table");
      console.log(res);
    });
  }

  fileDropped(event: any): void {
    console.log("file drop result:");
    this.fileHeaders = event.responseData;
  }
}

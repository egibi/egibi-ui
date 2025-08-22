import { Component, OnInit } from "@angular/core";
import { AppConfigurationService } from "../../app-configuration.service";
import { EntityType } from "../../../_models/entity-type.model";
import { EgibiTableComponent } from "../../../_components/egibi-table/egibi-table.component";
import { TableColumn } from "../../../_components/egibi-table/egibi-table.models";

@Component({
  selector: "entity-types",
  standalone: true,
  imports: [EgibiTableComponent],
  templateUrl: "./entity-types.component.html",
  styleUrl: "./entity-types.component.scss",
})
export class EntityTypesComponent implements OnInit {
  entityTypeTables: string[] = [];
  resultsTableColumns: TableColumn[] = [
    { key: "id", label: "ID", sortable: true },
    { key: "name", label: "Name", sortable: true },
    { key: "description", label: "Description", sortable: true },
    { key: "notes", label: "Notes", sortable: true },
    { key: "active", label: "Active", sortable: true },
    { key: "createdAt", label: "Created", sortable: true },
    { key: "lastModifiedAt", label: "Last Modified", sortable: true },
    { key: "sortOrder", label: "Sort Order", sortable: true },
  ];

  selectedEntityTypeTable: string;

  entityTypeRecords: EntityType[] = [];

  constructor(private configService: AppConfigurationService) {}

  ngOnInit(): void {
    this.configService.getEntityTypeTables().subscribe((res) => {
      this.entityTypeTables = res.responseData;
    });
  }

  public optionChanged(value: string) {
    if (value) {
      this.selectedEntityTypeTable = value;
      console.log("get type details");
      this.getEntityTypeRecords(value);
    }
  }

  public getEntityTypeRecords(tableName: string): void {
    this.configService.getEntityTypeRecords(tableName).subscribe((res) => {
      console.log("EntityTypeRecords:::");
      console.log(res.responseData);
      this.entityTypeRecords = res.responseData;
    });
  }

  public addNewEntityType(): void {}

  //===============================================================================
  // ADD NEW ENTITY TYPE MODAL
  //===============================================================================
  
}

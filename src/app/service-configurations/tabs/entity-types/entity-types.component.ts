import { Component, OnInit } from "@angular/core";
import { ServiceConfigurationsService } from "../../service-configurations.service";
import { EntityBase } from "../../../_models/entity-base.model";
import { EntityType } from "../../../_models/entity-type.model";

@Component({
  selector: "entity-types",
  imports: [ ],
  templateUrl: "./entity-types.component.html",
  styleUrl: "./entity-types.component.scss",
})
export class EntityTypesComponent implements OnInit {
  entityTypes: string[] = [];
  entityTypeRecords: EntityBase[] = [];
  tableSelected: boolean = false;
  selectedTable: string;

  constructor(private serviceConfigurationService: ServiceConfigurationsService) {}

  ngOnInit(): void {
    this.getEntityTypeTables();
  }

  public getEntityTypeTables(): void {
    this.serviceConfigurationService.getEntityTypeTables().subscribe((res) => {
      this.entityTypes = res.responseData;
    });
  }

  public getEntityTypeRecords(tableName: string): void {
    this.serviceConfigurationService.getEntityTypeRecords(tableName).subscribe((res) => {
      this.entityTypeRecords = res.responseData;
    });
  }

  public tableSelectionChanged(selected: any) {
    this.tableSelected = true;
    const selectedValue = (selected.target as HTMLSelectElement).value;
    this.selectedTable = selectedValue;

    if (selectedValue != "null") {
      this.serviceConfigurationService.setSelectedEntityTypeTable(selectedValue);
      this.serviceConfigurationService.getEntityTypeRecords(selectedValue).subscribe((res) => {
        this.entityTypeRecords = res.responseData;
      });
    } else {
      this.tableSelected = false;
    }
  }

  public createEntityTypeValue(): void {

  }

  public saveEntityType(result: any) {
    console.log("saveEntityType()");
    console.log(result);

    if (result) {
      let entityType: EntityType = new EntityType();
      entityType.id = 0;
      entityType.name = result.name;
      entityType.description = result.description;

      this.serviceConfigurationService.saveEntityType(entityType).subscribe((res) => {
        console.log("saved:::");
        console.log(res);
      });
    }
  }

  // =========================================================================================================
  // TABLE
  // =========================================================================================================

  public setupTable(columns: any, data: any, config: any): void {
  }
}

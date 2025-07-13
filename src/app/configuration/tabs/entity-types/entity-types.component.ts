import { Component, OnInit } from "@angular/core";
import { ConfigurationService } from "../../configuration.service";
import { EntityBase } from "../../../_models/entity-base.model";
import { ModalService } from "../../../_services/modal.service";
import { EntityTypesModalComponent } from "../../modals/entity-types-modal/entity-types-modal.component";
import { EntityType } from "../../../_models/entity-type.model";
@Component({
  selector: "entity-types",
  imports: [],
  templateUrl: "./entity-types.component.html",
  styleUrl: "./entity-types.component.scss",
})
export class EntityTypesComponent implements OnInit {
  entityTypes: string[] = [];
  entityTypeRecords: EntityBase[] = [];
  tableSelected: boolean = false;
  selectedTable: string;

  constructor(private configurationService: ConfigurationService, private modalservice: ModalService) {}

  ngOnInit(): void {
    this.getEntityTypeTables();
  }

  public getEntityTypeTables(): void {
    this.configurationService.getEntityTypeTables().subscribe((res) => {
      this.entityTypes = res.responseData;
    });
  }

  public getEntityTypeRecords(tableName: string): void {
    this.configurationService.getEntityTypeRecords(tableName).subscribe((res) => {
      this.entityTypeRecords = res.responseData;
    });
  }

  public tableSelectionChanged(selected: any) {
    this.tableSelected = true;
    const selectedValue = (selected.target as HTMLSelectElement).value;
    this.selectedTable = selectedValue;

    if (selectedValue != "null") {
      this.configurationService.setSelectedEntityTypeTable(selectedValue);
      this.configurationService.getEntityTypeRecords(selectedValue).subscribe((res) => {
        this.entityTypeRecords = res.responseData;
      });
    } else {
      this.tableSelected = false;
    }
  }

  public createEntityTypeValue(): void {
    this.openModal();
  }

  public saveEntityType(result: any) {
    console.log("saveEntityType()");
    console.log(result);

    if (result) {
      let entityType: EntityType = new EntityType();
      entityType.id = 0;
      entityType.name = result.name;
      entityType.description = result.description;

      this.configurationService.saveEntityType(entityType).subscribe((res) => {
        console.log("saved:::");
        console.log(res);
      });
    }
  }

  // =========================================================================================================
  // MODAL
  // =========================================================================================================
  public openModal(): void {
    console.log("attempting to open modal...");

    const modalRef = this.modalservice.open("entity types", EntityTypesModalComponent, this.selectedTable);

    modalRef.componentInstance.bodyComponent = EntityTypesModalComponent;

    modalRef.result.then(
      (result) => {
        if (result) {

          console.log('entity table:::', this.configurationService.getSelectedEntityTypeTable());


          const entityType = result.value as EntityType;
          entityType.tableName = this.configurationService.getSelectedEntityTypeTable();

          console.log('Angular entityType attempting to save:::', entityType)

          this.configurationService.saveEntityType(entityType).subscribe((res) => {
            console.log('entity type save response:::');
            console.log(res);
          });
        }
      },
      (reason) => {}
    );
  }
}

import { Component, OnInit } from "@angular/core";
import { AppConfigurationService } from "../../app-configuration.service";
import { EntityType } from "../../../_models/entity-type.model";
import { EgibiTableComponent } from "../../../_components/egibi-table/egibi-table.component";
import { TableColumn } from "../../../_components/egibi-table/egibi-table.models";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { NgbGlobalModalService } from "../../../_services/ngb-global-modal.service";
import { CreateEntityTypeModalComponent } from "../../modal-components/create-entity-type-modal/create-entity-type-modal.component";
import { ToastService } from "../../../_services/toast.service";
import { ToastComponent } from "../../../_components/toast/toast.component";
import { EditEntityTypeModalComponent } from "../../modal-components/edit-entity-type-modal/edit-entity-type-modal.component";

@Component({
  selector: "entity-types",
  standalone: true,
  imports: [EgibiTableComponent, ToastComponent],
  templateUrl: "./entity-types.component.html",
  styleUrl: "./entity-types.component.scss",
})
export class EntityTypesComponent implements OnInit {
  entityTypeTables: string[] = [];
  addNewButtonDisabled = true;

  resultsTableColumns: TableColumn[] = [
    { key: "id", label: "ID", sortable: true },
    { key: "name", label: "Name", sortable: true },
    { key: "description", label: "Description", sortable: true },
    { key: "notes", label: "Notes", sortable: true },
    { key: "active", label: "Active", sortable: true },
    { key: "createdAt", label: "Created", sortable: true },
    { key: "lastModifiedAt", label: "Last Modified", sortable: true },
  ];

  selectedEntityTypeTable: string;

  entityTypeRecords: EntityType[] = [];

  constructor(private toastService: ToastService, private configService: AppConfigurationService, private modalService: NgbGlobalModalService) {}

  ngOnInit(): void {
    this.configService.getEntityTypeTables().subscribe((res) => {
      this.entityTypeTables = res.responseData;
    });
  }

  public optionChanged(value: string) {
    if (value) {
      this.addNewButtonDisabled = false;
      this.selectedEntityTypeTable = value;
      console.log("get type details");
      this.getEntityTypeRecords(value);
    } else {
      this.addNewButtonDisabled = true;
      this.entityTypeRecords = [];
      this.selectedEntityTypeTable = "";
    }
  }

  public getEntityTypeRecords(tableName: string): void {
    this.configService.getEntityTypeRecords(tableName).subscribe((res) => {
      this.entityTypeRecords = res.responseData;
    });
  }

  //===============================================================================
  // ADD NEW ENTITY TYPE MODAL
  //===============================================================================
  addEntityTypeLastResult: any = null;
  public addNewEntityType(event: any): void {
    if (!this.selectedEntityTypeTable) {
      this.toastService.showError("No EntityType selected", "Error");
    } else {
      this.modalService
        .openModal(
          CreateEntityTypeModalComponent,
          { size: "sm", centered: true },
          {
            // title: "Create Entity Type",
            title: `Create ${this.selectedEntityTypeTable}`,
          }
        )
        .subscribe((result) => {
          this.addEntityTypeLastResult = result;

          //TODO: Save new entityType record
          if (result) {
            this.createEntityType(result);
          }

          // console.log("create entity type confirmation result", result);
        });
    }
  }

  //===============================================================================
  // HANDLE ADDING NEW ENTITY TYPE TO TABLE
  //===============================================================================
  private createEntityType(result: any): void {

    const data = result.result;

    let entityType: EntityType = new EntityType;
    entityType.name = data.name;
    entityType.description = data.description;
    entityType.notes = data.notes;
    entityType.isActive = data.isActive;
    entityType.tableName = this.selectedEntityTypeTable;

    this.configService.saveEntityType(entityType).subscribe((res) => {
      console.log('entity type saved; reset table');
    });
  }

  //===============================================================================
  // HANDLE EDITING ENTITY TYPE (MODAL)
  //===============================================================================  
  editEntityTypeLastResult: any = null;
  public editEntityType(entityType: EntityType): void {

    entityType.tableName = this.selectedEntityTypeTable;

    console.log('editing entity type:::');
    console.log(entityType);

    if (!this.selectedEntityTypeTable) {
      this.toastService.showError("No EntityType selected", "Error");
    } else {
      this.modalService
        .openModal(
          EditEntityTypeModalComponent,
          { size: "lg", centered: true },
          {
            // title: "Create Entity Type",
            title: `Edit ${this.selectedEntityTypeTable}`,
            entityType: entityType
          }
        )
        .subscribe((result) => {
          this.editEntityTypeLastResult = result;

          //TODO: Update entityType record
          // if (result) {
          //   this.save(result);
          // }

        });
    }
  }  

}

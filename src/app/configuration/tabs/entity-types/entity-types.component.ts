import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ConfigurationService } from "../../configuration.service";
import { EntityBase } from "../../../_models/entity-base.model";
import { NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { ModalService } from "../../../_services/modal.service";
import { FancyTestModalComponent } from "../../../_modals/fancy-test-modal/fancy-test-modal.component";
import { EgibiModalComponent } from "../../../egibi-modal/egibi-modal.component";
import { EntityTypesModalComponent } from "../../modals/entity-types-modal/entity-types-modal.component";


@Component({
  selector: "entity-types",
  imports: [],
  templateUrl: "./entity-types.component.html",
  styleUrl: "./entity-types.component.scss",
})
export class EntityTypesComponent implements OnInit {
  entityTypes: string[] = [];
  entityTypeRecords: EntityBase[] = [];

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
    const selectedValue = (selected.target as HTMLSelectElement).value;

    if (selectedValue != "null") {
      this.configurationService.getEntityTypeRecords(selectedValue).subscribe((res) => {
        this.entityTypeRecords = res.responseData;
      });
    }
  }

  // =========================================================================================================
  // MODAL
  // =========================================================================================================
  public openModal(): void {
    const modalRef = this.modalservice.open("Edit Entity Type", EntityTypesModalComponent);
    modalRef.result
    .then(result => console.log('Modal closed with:', result))
    .catch(reason => console.log('modal dismissed with:', reason));

  }
}

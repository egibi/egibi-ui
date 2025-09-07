import { Component, Input, Output, OnInit, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ReactiveFormsModule, FormGroup, FormBuilder } from "@angular/forms";
import { AppConfigurationService } from "../../../app-configuration.service";
import { EntityType } from "../../../../_models/entity-type.model";
import { NgbGlobalModalService } from "../../../../_services/ngb-global-modal.service";
import { ConfirmationModalComponent } from "../../../../_components/ngb-global-modal-components/confirmation-modal/confirmation-modal.component";

@Component({
  selector: "edit-entity-type-modal",
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./edit-entity-type-modal.component.html",
  styleUrl: "./edit-entity-type-modal.component.scss",
})
export class EditEntityTypeModalComponent implements OnInit {
  @Input() title?: string;
  @Input() entityType: EntityType;

  form: FormGroup;

  wasDeleted: boolean = false;

  constructor(public activeModal: NgbActiveModal, private fb: FormBuilder, private configService: AppConfigurationService, private modalService: NgbGlobalModalService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [""],
      description: [""],
      notes: [""],
    });

    this.form.patchValue(this.entityType);
  }

  public deleteEntityType(): void {
    // Confirmation modal to confirm deletion of EntityType
    this.modalService.openModal(ConfirmationModalComponent, { size: "sm", centered: true }, { title: "Confirm" }).subscribe((result: any) => {
      if (result && !result.dismissed) {
        this.configService.deleteEntityType(this.entityType).subscribe((res) => {
          this.configService.setDeletedEntityType(res.responseData);
          this.dismiss({ dismissed: true, reason: "delete confirmed" });
          this.wasDeleted = true;
        });
      }
    });
  }

  dismiss(dismissedReason: any): void {
    this.activeModal.dismiss(dismissedReason);
  }

  confirm(closedReason: any): void {
    this.activeModal.close();
  }
}

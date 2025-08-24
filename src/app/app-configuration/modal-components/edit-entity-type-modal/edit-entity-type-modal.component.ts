import { Component, Input, Output, OnInit, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ReactiveFormsModule, FormGroup, FormBuilder } from "@angular/forms";
import { AppConfigurationService } from "../../app-configuration.service";
import { EntityType } from "../../../_models/entity-type.model";

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

  constructor(public activeModal: NgbActiveModal, private fb: FormBuilder, private appConfigService: AppConfigurationService) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [""],
      description: [""],
      notes: [""],
    });

    this.form.patchValue(this.entityType);
  }

  public deleteEntityType(): void {
    this.appConfigService.deleteEntityType(this.entityType).subscribe((res) => {
      console.log('attempt entityType delete:::');
      console.log(res);
    });
  }

  dismiss(dismissedReason: string): void {
    this.activeModal.dismiss(dismissedReason);
  }

  confirm(): void {
    this.activeModal.close(this.form.value);
  }
}

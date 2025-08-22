import { Component, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ReactiveFormsModule, FormGroup, FormControl, FormBuilder } from "@angular/forms";

@Component({
  selector: "create-entity-type-modal",
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./create-entity-type-modal.component.html",
  styleUrl: "./create-entity-type-modal.component.scss",
})
export class CreateEntityTypeModalComponent implements OnInit {
  @Input() title?: string;
  form: FormGroup;

  constructor(public activeModal: NgbActiveModal, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: [""],
      description: [""],
      notes: [""],
      active: [""],
      sortOrder: [""],
    });
  }

  dismiss(dismissedReason: string): void {
    this.activeModal.dismiss(dismissedReason);
  }

  confirm(): void {
    this.activeModal.close({ formData: this.form.value });
  }

}

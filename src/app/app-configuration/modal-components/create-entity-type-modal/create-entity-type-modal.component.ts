import { Component, Input, Output, OnInit, EventEmitter } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ReactiveFormsModule, FormGroup, FormBuilder } from "@angular/forms";
@Component({
  selector: "create-entity-type-modal",
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./create-entity-type-modal.component.html",
  styleUrl: "./create-entity-type-modal.component.scss",
})
export class CreateEntityTypeModalComponent implements OnInit {
  @Input() title?: string;
  @Output() createEntityTypeRecord = new EventEmitter<any>();
  form: FormGroup;

  constructor(public activeModal: NgbActiveModal, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id: [""],
      name: [""],
      description: [""],
      notes: [""],
      tableName:[""],
      isActive: [""],
      createdAt:[""],
      lastModifiedAt:[""]

    });
  }

  dismiss(dismissedReason: string): void {
    this.activeModal.dismiss(dismissedReason);
  }

  confirm(): void {
    this.activeModal.close(this.form.value);  
  }

}

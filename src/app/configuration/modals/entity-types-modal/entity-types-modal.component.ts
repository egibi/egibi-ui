import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";

@Component({
  selector: "entity-types-modal",
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: "./entity-types-modal.component.html",
  styleUrl: "./entity-types-modal.component.scss",
})
export class EntityTypesModalComponent implements OnInit {
  public entityTypeForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.entityTypeForm = this.fb.group({
      tableName: [""],
      name: [""],
      description: [""],
    });
  }

  ngOnInit(): void {}

  public getData(): any {
    return { value: this.entityTypeForm.value }
  }
}

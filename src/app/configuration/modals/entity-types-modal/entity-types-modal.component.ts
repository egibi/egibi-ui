import { CommonModule } from "@angular/common";
import { Component, Input, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from "@angular/forms";
import { ConfigurationService } from "../../configuration.service";
@Component({
  selector: "entity-types-modal",
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: "./entity-types-modal.component.html",
  styleUrl: "./entity-types-modal.component.scss",
})
export class EntityTypesModalComponent implements OnInit {
  @Input() tableName: string;

  public entityTypeForm: FormGroup;

  constructor(private fb: FormBuilder, private configurationService: ConfigurationService) {
    this.entityTypeForm = this.fb.group({
      name: [""],
      description: [""],
    });
  }

  ngOnInit(): void {}

  public getData(): any {
    return { value: this.entityTypeForm.value };
  }
}

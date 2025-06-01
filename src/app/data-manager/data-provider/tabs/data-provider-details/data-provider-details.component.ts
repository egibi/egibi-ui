import { Component, OnInit, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from "@angular/forms";
import { DataProviderType } from "../../../../_models/data-provider-type.model";
import { DataFormatType } from "../../../../_models/data-format-type.model";
import { DataFrequencyType } from "../../../../_models/data-frequency-type.model";

@Component({
  selector: "data-provider-details",
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: "./data-provider-details.component.html",
  styleUrl: "./data-provider-details.component.scss",
})
export class DataProviderDetailsComponent implements OnInit {
  @Input() detailsForm: FormGroup;
  @Input() dataProviderTypes: DataProviderType[] = [];
  @Input() dataFormatTypes: DataFormatType[] = [];
  @Input() dataFrequencyTypes: DataFrequencyType[] = [];

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {}
}

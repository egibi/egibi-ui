import { Component, OnInit, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from "@angular/forms";

@Component({
  selector: "data-provider-details",
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: "./data-provider-details.component.html",
  styleUrl: "./data-provider-details.component.scss",
})
export class DataProviderDetailsComponent implements OnInit {
  @Input() detailsForm: FormGroup;

  // public detailsForm: FormGroup;

  // TEST VALUES ============================================================
  dataProviderTypes: any[] = [
    { id: 1, name: "File" },
    { id: 2, name: "API" },
    { id: 3, name: "Websocket" },
    { id: 4, name: "LLM" },
  ];


  //=========================================================================

  constructor(private fb: FormBuilder) {
    // this.detailsForm = this.fb.group({
    //   dataProviderId: [""],
    //   dataProviderTypeId: [""],
    //   dataFormatId: [""],
    //   dataFrequencyId: [""],
    //   name: [""],
    //   description: [""],
    //   notes: [""],
    //   start: [""],
    //   end: [""],
    // });
  }

  ngOnInit(): void {}
}

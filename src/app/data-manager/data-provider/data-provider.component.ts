import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { NgbNavModule } from "@ng-bootstrap/ng-bootstrap";
import { DataProviderDetailsComponent } from "./tabs/data-provider-details/data-provider-details.component";
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from "@angular/forms";
import { DataProviderType } from "../../_models/data-provider-type.model";
import { DataFrequencyType } from "../../_models/data-frequency-type.model";
import { DataFormatType } from "../../_models/data-format-type.model";

@Component({
  selector: "data-provider",
  imports: [ReactiveFormsModule, FormsModule, NgbNavModule, DataProviderDetailsComponent],
  templateUrl: "./data-provider.component.html",
  styleUrl: "./data-provider.component.scss",
})
export class DataProviderComponent implements OnInit {
  dataProviderId: string;
  dataProvider: any;

  public dataProviderTypes: DataProviderType[] = [];
  public dataFrequencyTypes: DataFrequencyType[] = [];
  public dataFormatTypes: DataFormatType[] = [];

  public detailsForm: FormGroup;

  public active = 1;

  constructor(private route: ActivatedRoute, private fb: FormBuilder) {}

  ngOnInit(): void {

    

    this.detailsForm = this.fb.group({
      dataProviderId: [""],
      dataProviderTypeId: [""],
      dataFormatId: [""],
      dataFrequencyId: [""],
      name: [""],
      description: [""],
      notes: [""],
      start: [""],
      end: [""],
    });

    this.dataProviderId = this.route.snapshot.paramMap.get("id")!;

    if (this.dataProviderId === "0") {
      console.log("setup new data provider....");
    } else {
      console.log("load data provider details for ID:", this.dataProviderId);
    }
  }

  public save(): void {

    console.log('saving...');
    console.log(this.detailsForm.value);

  }

  public cancel(): void {}
}

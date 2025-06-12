import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, RouterModule, Router } from "@angular/router";
import { NgbNavModule } from "@ng-bootstrap/ng-bootstrap";
import { DataProviderDetailsComponent } from "./tabs/data-provider-details/data-provider-details.component";
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from "@angular/forms";
import { DataProvider } from "../../_models/data-provider.model";
import { DataProviderType } from "../../_models/data-provider-type.model";
import { DataFrequencyType } from "../../_models/data-frequency-type.model";
import { DataFormatType } from "../../_models/data-format-type.model";
import { DataManagerService } from "../data-manager.service";
import { DateTimeConvert } from "../../_utilities/datetime.utilities";
import { Convert } from "../../_utilities/convert.utilities";
import { DataProviderMappingComponent } from "./tabs/data-provider-mapping/data-provider-mapping.component";

@Component({
  selector: "data-provider",
  imports: [ReactiveFormsModule, FormsModule, NgbNavModule, DataProviderDetailsComponent, DataProviderMappingComponent],
  templateUrl: "./data-provider.component.html",
  styleUrl: "./data-provider.component.scss",
})
export class DataProviderComponent implements OnInit {
  dataProviderId: number;
  dataProvider: DataProvider;

  public dataProviderTypes: DataProviderType[] = [];
  public dataFrequencyTypes: DataFrequencyType[] = [];
  public dataFormatTypes: DataFormatType[] = [];

  public detailsForm: FormGroup;

  public active = 1;

  constructor(private router: Router, private route: ActivatedRoute, private fb: FormBuilder, private dataManagerService: DataManagerService) {}

  ngOnInit(): void {
    this.dataProviderId = Number(this.route.snapshot.paramMap.get("id")!);

    if (this.dataProviderId !== 0) {
      this.dataManagerService.getDataProvider(this.dataProviderId).subscribe((res) => {
        this.dataProvider = res.responseData;
        this.detailsForm.patchValue(res.responseData);
        this.detailsForm.get("start")?.setValue(DateTimeConvert.UtcStringToLocal(res.responseData.start));
        this.detailsForm.get("end")?.setValue(DateTimeConvert.UtcStringToLocal(res.responseData.end));
      });
    }

    this.dataManagerService.getDataProviderTypes().subscribe((res) => {
      this.dataProviderTypes = res.responseData;
    });

    this.dataManagerService.getDataFormatTypes().subscribe((res) => {
      this.dataFormatTypes = res.responseData;
    });

    this.dataManagerService.getDataFrequencyTypes().subscribe((res) => {
      this.dataFrequencyTypes = res.responseData;
    });

    this.detailsForm = this.fb.group({
      id: [""],
      dataProviderId: [""],
      dataProviderTypeId: [""],
      dataFormatTypeId: [""],
      dataFrequencyTypeId: [""],
      name: [""],
      description: [""],
      notes: [""],
      start: [""],
      end: [""],
    });

    if (this.dataProviderId === 0) {
      console.log("setup new data provider....");
    } else {
      console.log("load data provider details for ID:", this.dataProviderId);
      this.detailsForm.get("dataProviderId")?.setValue(this.dataProviderId);
    }
  }

  public save(): void {
    let dataProvider: DataProvider = this.detailsForm.value;

    dataProvider.id = Convert.stringToNumber(dataProvider.id);
    dataProvider.dataProviderTypeId = Convert.stringToNumber(dataProvider.dataProviderTypeId);
    dataProvider.dataFormatId = Convert.stringToNumber(dataProvider.dataFormatId);
    dataProvider.dataFrequencyId = Convert.stringToNumber(dataProvider.dataFrequencyId);

    console.log("object being saved...");
    console.log(dataProvider);

    this.dataManagerService.saveDataProvider(dataProvider).subscribe((res) => {
      console.log("saved...");
      console.log(res);
    });
  }

  public cancel(): void {
    this.router.navigate(["data-manager"]);
  }
}

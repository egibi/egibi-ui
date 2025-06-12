import { Component, OnInit, inject, WritableSignal, signal, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { DataManagerService } from "../../../data-manager.service";
import { DataProviderType } from "../../../../_models/data-provider-type.model";
import { DataProviderConnectionComponent } from "../../../details-subcomponents/data-provider-connection/data-provider-connection.component";
import { DataProviderFileComponent } from "../../../details-subcomponents/data-provider-file/data-provider-file.component";

@Component({
  selector: "data-provider-mapping",
  imports: [CommonModule, DataProviderConnectionComponent, DataProviderFileComponent],
  templateUrl: "./data-provider-mapping.component.html",
  styleUrl: "./data-provider-mapping.component.scss",
})
export class DataProviderMappingComponent implements OnInit {  
  public selectedDataProviderType: DataProviderType;
  public mapFromFile: boolean;
  public mapFromConnection: boolean;
  public questDbTables: string[] = [];
  public fileHeaders: string[] = [];

  constructor(private dataManagerService: DataManagerService) {}

  ngOnInit(): void {
    this.dataManagerService.listQuestDbTables().subscribe((res) => {
      this.questDbTables = res.responseData;
    });

    this.selectedDataProviderType = this.dataManagerService.getSelectedDataProviderType();
    if (this.selectedDataProviderType.name == "File") {
      this.mapFromFile = true;
      this.mapFromConnection = false;
    } else {
      this.mapFromFile = false;
      this.mapFromConnection = true;
    }
  }





  public openDataMapper(): void {

    console.log('should open data mapper...');
    // const modalRef = this.modalService.open(DataMapperComponent);
    // modalRef.result.then(
    //   (result) => console.log("closed with:", result),
    //   (reason) => console.log("Dismissed with:", reason)
    // );
  }
}

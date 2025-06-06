import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FileDropComponent } from "../../../_components/file-drop/file-drop.component";
import { DataManagerService } from "../../data-manager.service";

@Component({
  selector: "data-provider-file",
  standalone: true,
  imports: [FileDropComponent, CommonModule],
  templateUrl: "./data-provider-file.component.html",
  styleUrl: "./data-provider-file.component.scss",
})
export class DataProviderFileComponent {
  public fileHeaders: string[] = [];

  constructor(private dataManagerService:DataManagerService) {}

  public createTable(): void {

  }

  fileDropped(event: any): void {
    console.log("file drop result:");
    this.fileHeaders = event.responseData;
  }
}

import { Component } from "@angular/core";
import { ActivatedRoute, RouterModule, Router } from "@angular/router";
import { FileDropComponent } from "../_components/file-drop/file-drop.component";
import { NgbNavModule } from "@ng-bootstrap/ng-bootstrap";
import { DataProvidersGridComponent } from "./grids/data-providers-grid/data-providers-grid.component";

@Component({
  selector: "data-manager",
  imports: [NgbNavModule, FileDropComponent, RouterModule, DataProvidersGridComponent],
  templateUrl: "./data-manager.component.html",
  styleUrl: "./data-manager.component.scss",
})
export class DataManagerComponent {
  public active = 1;

  rowData: any[] = [
    { id: 1, name: "test01", description: "testDescription01" },
    { id: 2, name: "test02", description: "testDescription02" },
    { id: 3, name: "test03", description: "testDescription03" },
  ];

  // TEST GRID DATA=============================

  constructor(private router: Router, private route: ActivatedRoute) {}

  public addNew(): void {
    this.router.navigate(['data-manager/setup-data-provider']);
  }

  public rowClicked(e: any): void {
    console.log("row clicked...", e);
  }
}

import { Component, OnInit, ViewChild, inject, signal, WritableSignal, TemplateRef } from "@angular/core";
import { ActivatedRoute, RouterModule, Router } from "@angular/router";
import { NgbNavModule } from "@ng-bootstrap/ng-bootstrap";
import { DataProvidersGridComponent } from "./grids/data-providers-grid/data-providers-grid.component";
import { DataManagerService } from "./data-manager.service";
import { DataProvider } from "../_models/data-provider.model";
import { ModalDismissReasons, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { DataProviderComponent } from "./data-provider/data-provider.component";
@Component({
  selector: "data-manager",
  imports: [NgbNavModule, RouterModule, DataProvidersGridComponent],
  templateUrl: "./data-manager.component.html",
  styleUrl: "./data-manager.component.scss",
})
export class DataManagerComponent implements OnInit {
  @ViewChild(DataProvidersGridComponent) dataProvidersGrid: DataProvidersGridComponent;
  @ViewChild(DataProviderComponent) dataProviderComponent: DataProviderComponent;

  public active = 1;

  public modalService = inject(NgbModal);
  closeResult: WritableSignal<string> = signal("");

  rowData: DataProvider[] = [];

  constructor(private router: Router, private route: ActivatedRoute, private dataManagerService: DataManagerService) {}

  ngOnInit(): void {
    this.dataManagerService.getDataProviders().subscribe((res) => {
      this.rowData = res.responseData;
    });
  }

  public openModal(dataProvider: DataProvider, content: TemplateRef<any>) {
    this.modalService.open(content).result.then(
      (result) => {
        switch (result) {
          case "delete-confirm":
            this.deleteDataProvider();
            break;
        }
      },
      (reason) => {
        this.closeResult.set(`Dismissed ${this.getModalDismissedReason(reason)}`);
      }
    );
  }

  private getModalDismissedReason(reason: any): string {
    switch (reason) {
      case ModalDismissReasons.ESC:
        return "by pressing ESC";
      case ModalDismissReasons.BACKDROP_CLICK:
        return "by clicking on a backdrop";
      default:
        return `with: ${reason}`;
    }
  }

  public onActionSelect(selectedAction: any, deleteModal: any) {
    this.dataManagerService.setSelectedDataProvider(selectedAction.dataProvider);
    switch (selectedAction.name) {
      case "view":
        this.viewDataProvider(selectedAction.dataProvider.id);
        break;
      case "delete":
        this.openModal(selectedAction.dataProvider, deleteModal);
        break;
    }
  }

  public addNew(): void {
    this.router.navigate(["data-manager/data-provider/0"]);
  }

  private getDataProviders(): void {
    this.dataManagerService.getDataProviders().subscribe((res) => {
      this.dataProvidersGrid.rowData = res.responseData;
    });
  }

  public viewDataProvider(dataProviderId: number): void {
    this.router.navigate([`data-manager/data-provider/${dataProviderId}`]);
  }

  private deleteDataProvider(): void {
    let selectedDataProvider = this.dataManagerService.getSelectedDataProvider();
    this.dataManagerService.deleteDataProvider(selectedDataProvider).subscribe((res) => {
      this.getDataProviders();
    });
  }
}
import { Component, OnInit, ViewChild, inject, signal, WritableSignal, TemplateRef } from "@angular/core";
import { StrategiesService } from "./strategies.service";
import { CommonModule } from "@angular/common";
import { StrategiesGridComponent } from "./strategies-grid/strategies-grid.component";
import { AgGridModule } from "ag-grid-angular";
import { ModalDismissReasons, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { EgibiSharedService } from "../services/egibi-shared.service";
import { StrategiesGridService } from "./strategies-grid/strategies-grid.service";
import { Strategy } from "../_models/strategy.model";
import { StrategyComponent } from "./strategy/strategy.component";

@Component({
  selector: "strategies",
  imports: [CommonModule, AgGridModule, StrategiesGridComponent, StrategyComponent],
  templateUrl: "./strategies.component.html",
  styleUrl: "./strategies.component.scss",
})
export class StrategiesComponent implements OnInit {
  @ViewChild(StrategiesGridComponent) strategiesGrid: StrategiesGridComponent;
  @ViewChild(StrategyComponent) strategyComponent: StrategyComponent;

  public selectedStrategy: Strategy;

  public modalService = inject(NgbModal);
  closeResult: WritableSignal<string> = signal("");
  public rowData: Strategy[] = [];

  constructor(private egibiService: EgibiSharedService, private strategiesService: StrategiesService, private StrategiesGridService: StrategiesGridService) {}

  public ngOnInit(): void {
    this.getStrategies();
  }

  // ============================================================================================================
  // MODAL
  //_____________________________________________________________________________________________________________
  public openModal(strategy: Strategy, content: TemplateRef<any>) {
    this.modalService.open(content).result.then(
      (result) => {
        switch (result) {
          case "create-save":
          case "edit-save":
            this.saveStrategy();
            break;
          case "delete-confirm":
            this.deleteStrategy();
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

  public onActionSelect(selectedAction: any, createModal: any, editModal: any, deleteModal: any) {
    this.strategiesService.setSelectedStrategy(selectedAction.strategy);
    switch (selectedAction.name) {
      case "create":
        this.openModal(new Strategy(), createModal);
        break;
      case "edit":
        this.openModal(selectedAction.connection, editModal);
        break;
      case "delete":
        this.openModal(selectedAction.connection, deleteModal);

        break;
    }
  }
  // ************************************************************************************************************

  private getStrategies(): void {
    this.strategiesService.getStrategies().subscribe((res) => {
      this.strategiesGrid.rowData = res.responseData;
    });
  }

  private saveStrategy(): void {
    let details = this.strategyComponent.strategyDetailsForm.value;

    if (details.strategyID == "") details.strategyID = 0;

    this.strategiesService.saveStrategy(details).subscribe((res) => {
      this.getStrategies();
    });
  }

  private deleteStrategy(): void {
    let selectedStrategy = this.strategiesService.getSelectedStrategy();
    this.strategiesService.deleteStrategy(selectedStrategy).subscribe((res) => {
      this.getStrategies();
    });
  }
}

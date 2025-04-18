import { Component, OnInit, ViewChild, inject, signal, WritableSignal, TemplateRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, RouterModule, Router, ActivationEnd } from "@angular/router";
import { AgGridModule } from "ag-grid-angular";
import { ModalDismissReasons, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, FormsModule } from "@angular/forms";
import { BacktestParamsComponent } from "./backtest-params/backtest-params.component";
import { BacktesterService } from "./backtester.service";
import { SelectOption } from "../_models/select-option.model";
import { BacktestsGridComponent } from "./backtests-grid/backtests-grid.component";
import { Backtest } from "./backtester.models";
import { BacktestComponent } from "./backtest/backtest.component";

@Component({
  selector: "backtester",
  imports: [CommonModule, RouterModule, AgGridModule, ReactiveFormsModule, FormsModule, BacktestComponent, BacktestParamsComponent, BacktestsGridComponent],
  templateUrl: "./backtester.component.html",
  styleUrl: "./backtester.component.scss",
})
export class BacktesterComponent implements OnInit {
  @ViewChild(BacktestsGridComponent) backtestsGrid: BacktestsGridComponent;
  @ViewChild(BacktestComponent) backtestComponent: BacktestComponent;

  public selectedBacktest: Backtest;
  public modalService = inject(NgbModal);

  closeResult: WritableSignal<string> = signal("");
  public rowData: Backtest[] = [];
  public dataSources: SelectOption[] = [];

  constructor(private fb: FormBuilder, private router: Router, private route: ActivatedRoute, private backtesterService: BacktesterService) {}

  ngOnInit(): void {
    this.getBacktests();

    this.backtesterService.getDataSources().subscribe((res) => {
      this.dataSources = res.responseData;
    });
  }

  // ============================================================================================================
  // MODAL
  //_____________________________________________________________________________________________________________
  public openModal(backtest: Backtest, content: TemplateRef<any>) {
    this.modalService.open(content).result.then(
      (result) => {
        switch (result) {
          case "create-save":
          case "edit-save":
            this.saveBacktest();
            break;
          case "delete-confirm":
            this.deleteBacktest();
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
    this.backtesterService.setSelectedBacktest(selectedAction.backtest);
    let backtestID = this.backtesterService.getSelectedBacktest().backtestID;

    switch (selectedAction.name) {
      case "create":
        this.openModal(new Backtest(), createModal);
        break;
      case "edit":
        this.openModal(selectedAction.connection, editModal);
        break;
      case "view":
        this.navigateToChildRoute("backtest", backtestID);
        break;
      case "delete":
        this.openModal(selectedAction.connection, deleteModal);

        break;
    }
  }
  // ************************************************************************************************************

  private getBacktests(): void {
    this.backtesterService.getBacktests().subscribe((res) => {
      console.log("getbacktests()...");
      console.log(res);
      this.backtestsGrid.rowData = res.responseData;
      console.log("row data is set...");
    });
  }

  private saveBacktest(): void {
    let details = this.backtestComponent.backtestDetailsForm.value;

    if (details.backtestID == "") details.backtestID = 0;

    this.backtesterService.saveBacktest(details).subscribe((res) => {
      this.getBacktests();
    });
  }

  private deleteBacktest(): void {
    let selectedBacktest = this.backtesterService.getSelectedBacktest();
    this.backtesterService.deleteBacktest(selectedBacktest).subscribe((res) => {
      this.getBacktests();
    });
  }

  private navigateToChildRoute(childPath: string, backtestID: string): void {
    console.log("should navigate to: ", childPath);
    this.router.navigate([`backtester/${childPath}`, backtestID]);
  }
}

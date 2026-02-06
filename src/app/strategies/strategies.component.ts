// FILE: egibi-ui/src/app/strategies/strategies.component.ts

import { Component, OnInit, ViewChild, inject, signal, WritableSignal, TemplateRef } from "@angular/core";
import { Router } from "@angular/router";
import { StrategiesService } from "../_services/strategies.service";
import { CommonModule } from "@angular/common";
import { StrategiesGridComponent } from "./strategies-grid/strategies-grid.component";
import { AgGridModule } from "ag-grid-angular";
import { ModalDismissReasons, NgbModal } from "@ng-bootstrap/ng-bootstrap";
import { StrategiesGridService } from "./strategies-grid/strategies-grid.service";
import { Strategy } from "../_models/strategy.model";

@Component({
  selector: "strategies",
  imports: [CommonModule, AgGridModule, StrategiesGridComponent],
  templateUrl: "./strategies.component.html",
  styleUrl: "./strategies.component.scss",
})
export class StrategiesComponent implements OnInit {
  @ViewChild(StrategiesGridComponent) strategiesGrid: StrategiesGridComponent;

  public selectedStrategy: Strategy | null = null;
  public modalService = inject(NgbModal);
  closeResult: WritableSignal<string> = signal("");
  public rowData: Strategy[] = [];

  constructor(
    private strategiesService: StrategiesService,
    private strategiesGridService: StrategiesGridService,
    private router: Router
  ) {}

  public ngOnInit(): void {
    this.getStrategies();
  }

  // ============================================================================================================
  // NAVIGATION
  //_____________________________________________________________________________________________________________

  public createNewStrategy() {
    this.router.navigate(['/strategies', 'new']);
  }

  public onActionSelect(selectedAction: any, deleteModal: any) {
    if (selectedAction.strategy) {
      this.selectedStrategy = selectedAction.strategy;
    }

    switch (selectedAction.name) {
      case "create":
        this.createNewStrategy();
        break;
      case "edit":
        if (selectedAction.strategy?.id) {
          this.router.navigate(['/strategies', selectedAction.strategy.id]);
        }
        break;
      case "delete":
        this.openDeleteModal(selectedAction.strategy, deleteModal);
        break;
    }
  }

  // ============================================================================================================
  // DELETE MODAL
  //_____________________________________________________________________________________________________________

  public openDeleteModal(strategy: Strategy, content: TemplateRef<any>) {
    this.selectedStrategy = strategy;
    this.modalService.open(content).result.then(
      (result) => {
        if (result === 'delete-confirm') {
          this.deleteStrategy();
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

  // ============================================================================================================
  // DATA
  //_____________________________________________________________________________________________________________

  private async getStrategies(): Promise<void> {
    try {
      const res = await this.strategiesService.getAll();
      if (res?.responseCode === 200) {
        this.rowData = res.responseData || [];
        if (this.strategiesGrid) {
          this.strategiesGrid.rowData = this.rowData;
        }
      }
    } catch (err) {
      console.error('Failed to load strategies', err);
    }
  }

  private async deleteStrategy(): Promise<void> {
    if (!this.selectedStrategy?.id) return;

    try {
      await this.strategiesService.delete(this.selectedStrategy.id);
      await this.getStrategies();
    } catch (err) {
      console.error('Failed to delete strategy', err);
    }
  }
}

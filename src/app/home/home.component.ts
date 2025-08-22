import { Component, ViewChild } from "@angular/core";
import { ToastService } from "../_services/toast.service";
import { CommonModule } from "@angular/common";
import { ToastComponent } from "../_components/toast/toast.component";
import { NgbGlobalModalService } from "../_services/ngb-global-modal.service";
import { ConfirmationModalComponent } from "../_components/ngb-global-modal-components/confirmation-modal/confirmation-modal.component";
@Component({
  selector: "home",
  imports: [CommonModule, ToastComponent],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.scss",
})
export class HomeComponent {

  //modal result
   lastResult: any = null;

  constructor(private toastService: ToastService, private modalService:NgbGlobalModalService) {}

  testSuccessToast(): void {
    this.toastService.showSuccess("Saved Successfully", "Success");
  }

  testErrorToast(): void {
    this.toastService.showError("There was an error", "Error");
  }

  testInfoToast(): void {
    this.toastService.showInfo("Here is some info", "Info");
  }

  testWarningToast(): void {
    this.toastService.showWarning("This is a warning", "Warning");
  }

  openConfirmationModal(): void {
    this.modalService.openModal(
      ConfirmationModalComponent,
      { size: 'sm', centered: true },
      {
        title: 'Delete Item',
        message: 'Are you sure you want to delete this item?',
        details: 'This action cannot be undone.',
        confirmText: 'Delete',
        cancelText: 'Keep'
      }
    ).subscribe(result => {
      this.lastResult = result;
      console.log('Confirmation result:', result);
    });
  }
}

import { Component } from "@angular/core";
import { ToastService } from "../_services/toast.service";
import { CommonModule } from "@angular/common";
import { ToastComponent } from "../_components/toast/toast.component";
import { NgbGlobalModalService } from "../_services/ngb-global-modal.service";
import { ConfirmationModalComponent } from "../_components/ngb-global-modal-components/confirmation-modal/confirmation-modal.component";
import { EgibiModalComponent } from "../_components/egibi-modal/egibi-modal.component";
import { ModalContentTestComponent } from "../_modal-contents/modal-content-test/modal-content-test.component";
import { TestingService } from "../_services/testing.service";
import { SignalRChatComponent } from "../_signalr-components/signalr-chat/signalr-chat.component";
import { SignalrFileUploadComponent } from "../_signalr-components/signalr-file-upload/signalr-file-upload.component";
@Component({
  selector: "home",
  imports: [CommonModule, ToastComponent, SignalRChatComponent, SignalrFileUploadComponent],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.scss",
})
export class HomeComponent {

  //modal result
   lastResult: any = null;

  constructor(private toastService: ToastService, private modalService:NgbGlobalModalService, private testingService:TestingService) {}

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

  openTestModal():void{
    this.modalService.openModal(
      EgibiModalComponent,
      {size: 'lg', centered: true},
      {
        childComponent: ModalContentTestComponent,
        childInputs: {description: 'test description'},
        title: 'Test Modal'        
      }
    ).subscribe(result => {
      console.log('confirmation result:', result);
    })
  }

  testGeoDateTimeData():void{

    this.testingService.testGeoDateTimeData().subscribe((res) => {
      console.log('geo data time data result:::');
      console.log(res);
    });
  }


}

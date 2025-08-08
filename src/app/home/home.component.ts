import { Component, ViewChild } from "@angular/core";
import { ToastService } from "../_services/toast.service";
import { CommonModule } from "@angular/common";
import { ToastComponent } from "../_components/toast/toast.component";

@Component({
  selector: "home",
  imports: [CommonModule, ToastComponent],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.scss",
})
export class HomeComponent {
  constructor(private toastService:ToastService) {}

  testSuccessToast(): void {
    this.toastService.showSuccess('Saved Successfully', 'Success');
  }

  testErrorToast():void{
    this.toastService.showError('There was an error', 'Error');
  }

  testInfoToast():void{
    this.toastService.showInfo('Here is some info', 'Info');
  }

  testWarningToast():void{
    this.toastService.showWarning('This is a warning', 'Warning');
  }
}

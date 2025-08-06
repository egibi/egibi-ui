import { Injectable, signal } from "@angular/core";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { EgibiModalComponent } from "../egibi-modal/egibi-modal.component";

@Injectable({
  providedIn: 'root' // This registers it globally
})
export class ModalService {
  constructor(private modalService: NgbModal) {}

  modalData = signal<any>(null);

  setModalData(content: any) {
    this.modalData.update(() => content);
  }

  getModalData(): any {
    return this.modalData();
  }

  public open(title: string, bodyComponent: any, data: any): NgbModalRef {
    const modalRef = this.modalService.open(EgibiModalComponent, { centered: true, size: "lg" });
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.bodyComponent = bodyComponent;

    console.log(
      `This is the Egibi Modal Service [src/app/_services/modal.service.ts]. You just used me to service a custom modal component named "${title}" and tried to pass data to it.`
    );
    console.log(`The data you passed was recieved as: ${data}`);

    this.setModalData(data);
    return modalRef;
  }



}

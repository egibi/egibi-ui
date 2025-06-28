import { Injectable } from "@angular/core";
import { NgbModal, NgbModalRef } from "@ng-bootstrap/ng-bootstrap";
import { EgibiModalComponent } from "../egibi-modal/egibi-modal.component";


@Injectable({
  providedIn: "root",
})
export class ModalService {
  constructor(private modalService: NgbModal) {}

  open(title: string, bodyComponent: any): NgbModalRef {
    const modalRef = this.modalService.open(EgibiModalComponent, { centered: true, size: "lg" });
    modalRef.componentInstance.title = title;
    modalRef.componentInstance.bodyComponent = bodyComponent;
    return modalRef;
  }
}

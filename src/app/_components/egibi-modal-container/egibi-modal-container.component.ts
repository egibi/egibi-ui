import { Component, inject, Input } from '@angular/core';
import { NgbActiveModal, NgbModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'egibi-modal-container',
  imports: [],
  templateUrl: './egibi-modal-container.component.html',
  styleUrl: './egibi-modal-container.component.scss'
})

export class NgbdModalContent {
  activeModal = inject(NgbActiveModal);
};


export class EgibiModalContainerComponent {
  private modalSerivce = inject(NgbModal);

  open(){
    const modalref = this.modalSerivce.open(NgbdModalContent);
  }
}

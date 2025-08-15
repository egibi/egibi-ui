import { Component, Input } from "@angular/core";
import { CommonModule } from '@angular/common';
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "ngb-global-modal-base",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./ngb-global-modal-base.component.html",
  styleUrl: "./ngb-global-modal-base.component.scss",
})
export class NgbGlobalModalBaseComponent {
  @Input() title: string = "";
  @Input() showCloseButton: boolean = true;
  @Input() showFooter: boolean = true;
  @Input() showCancelButton: boolean = true;
  @Input() showConfirmButton: boolean = true;
  @Input() cancelButtonText: string = "Cancel";
  @Input() confirmButtonText: string = "Confirm";
  @Input() hasCustomFooter: boolean = false;

  constructor(public activeModal: NgbActiveModal) {}

  confirm(result?: any): void {
    this.activeModal.close(result);
  }

  dismiss(reason?: string): void {
    this.activeModal.dismiss(reason);
  }
}

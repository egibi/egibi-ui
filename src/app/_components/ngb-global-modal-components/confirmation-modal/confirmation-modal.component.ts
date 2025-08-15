import { Component, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "confirmation-modal",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./confirmation-modal.component.html",
  styleUrl: "./confirmation-modal.component.scss",
})
export class ConfirmationModalComponent {
  @Input() title?: string;
  @Input() message: string = "Are you sure you want to proceed?";
  @Input() details?: string;
  @Input() confirmText?: string;
  @Input() cancelText?: string;

  constructor(public activeModal: NgbActiveModal) {}

  confirm(): void {
    this.activeModal.close(true);
  }
}

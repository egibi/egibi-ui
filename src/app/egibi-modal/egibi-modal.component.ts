import { NgComponentOutlet } from "@angular/common";
import { Component, Input } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "egibi-modal",
  standalone:true,
  imports: [NgComponentOutlet],
  templateUrl: "./egibi-modal.component.html",
  styleUrl: "./egibi-modal.component.scss",
})
export class EgibiModalComponent {
  @Input() title: string = "Modal";
  @Input() bodyComponent!: any;

  constructor(public activeModal: NgbActiveModal) {}
}

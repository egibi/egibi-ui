import { Component, Input, Output, OnInit, EventEmitter, Type } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { CommonModule, NgComponentOutlet } from "@angular/common";

@Component({
  selector: "egibi-modal",
  standalone: true,
  imports: [NgComponentOutlet, CommonModule],
  templateUrl: "./egibi-modal.component.html",
  styleUrl: "./egibi-modal.component.scss",
})
export class EgibiModalComponent implements OnInit {
  @Input() childComponent!:Type<any>;
  @Input() childInputs: Record<string,any> = {};
  
  @Input() title?: string;

  constructor(public activeModal: NgbActiveModal) {}
  ngOnInit(): void {}

  dismiss(dismissedReason: string): void {
    console.log('modal dismissed');
  }

  confirm():void{
    console.log('modal confirmed')
  }
}

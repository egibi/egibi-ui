// import { NgComponentOutlet } from "@angular/common";
import { AfterViewInit, Component, ComponentRef, Input, ViewChild, ViewContainerRef } from "@angular/core";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "egibi-modal",
  standalone: true,
  // imports: [NgComponentOutlet],
  imports: [],
  templateUrl: "./egibi-modal.component.html",
  styleUrl: "./egibi-modal.component.scss",
})
export class EgibiModalComponent implements AfterViewInit {
  @Input() title: string = "Modal";
  @Input() bodyComponent!: any;

  @ViewChild("modalBody", { read: ViewContainerRef }) modalBody!: ViewContainerRef;
  private childComponentRef!: ComponentRef<any>;

  constructor(public activeModal: NgbActiveModal) {}

  ngAfterViewInit(): void {
    this.modalBody.clear();
    this.childComponentRef = this.modalBody.createComponent(this.bodyComponent);
  }

  public onSave(): void {
    if (this.childComponentRef) {
      const childInstance = this.childComponentRef.instance;
 
      // Example: assume the child component has a "getData()" method
      const data = childInstance.getData ? childInstance.getData() : childInstance;
      this.activeModal.close(data);
    } else {
      this.activeModal.close(null);
    }
  }
}

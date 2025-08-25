import { CommonModule } from "@angular/common";
import { Component, Input } from "@angular/core";

@Component({
  selector: "modal-content-test",
  standalone: true,
  imports: [CommonModule],
  templateUrl: "./modal-content-test.component.html",
  styleUrl: "./modal-content-test.component.scss",
})
export class ModalContentTestComponent {
  @Input() description: string;
}

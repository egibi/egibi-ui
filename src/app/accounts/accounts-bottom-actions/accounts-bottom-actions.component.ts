import { Component, EventEmitter, Output } from "@angular/core";

@Component({
  selector: "accounts-bottom-actions",
  imports: [],
  templateUrl: "./accounts-bottom-actions.component.html",
  styleUrl: "./accounts-bottom-actions.component.scss",
})
export class AccountsBottomActionsComponent {
  @Output() saveClicked = new EventEmitter<any>();
  @Output() cancelClicked = new EventEmitter<any>();
  @Output() deleteClicked = new EventEmitter<any>();

  public onSave(): void {
    this.saveClicked.emit();
  }

  public onCancel(): void {
    this.cancelClicked.emit();
  }

  public onDelete(): void {
    this.deleteClicked.emit();
  }
}

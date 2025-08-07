import { Component, Output, EventEmitter, OnInit } from "@angular/core";

@Component({
  selector: "accounts-top-actions",
  imports: [],
  templateUrl: "./accounts-top-actions.component.html",
  styleUrl: "./accounts-top-actions.component.scss",
})
export class AccountsTopActionsComponent implements OnInit {
  @Output() addAccount = new EventEmitter<any>();

  constructor() {}

  ngOnInit(): void {}

  public onAddAccount(event: any): void {
    console.log("adding account...");
    this.addAccount.emit(true);
  }
}

import { Component, Output, EventEmitter, OnInit } from "@angular/core";

@Component({
  selector: "accounts-action-bar",
  imports: [],
  templateUrl: "./accounts-action-bar.component.html",
  styleUrl: "./accounts-action-bar.component.scss",
})
export class AccountsActionBarComponent implements OnInit {
  @Output() addAccount = new EventEmitter<any>();
  
  constructor() {}

  ngOnInit(): void {}

  public onAddAccount(event:any): void {
    console.log("adding account...");
    this.addAccount.emit(true);
  }
}

import { Component, OnInit, ViewChild, inject, signal, WritableSignal, TemplateRef } from "@angular/core";
import { Router } from "@angular/router";
import { EgibiTableComponent } from "../_components/egibi-table/egibi-table.component";
import { Account } from "../_models/account.model";
import { AccountsService } from "./accounts.service";
import { TableColumn } from "../_components/egibi-table/egibi-table.models";
import { AccountsTopActionsComponent } from "./accounts-top-actions/accounts-top-actions.component";

@Component({
  selector: "accounts",
  standalone: true,
  imports: [EgibiTableComponent, AccountsTopActionsComponent],
  templateUrl: "./accounts.component.html",
  styleUrl: "./accounts.component.scss",
})
export class AccountsComponent implements OnInit {
  accounts: Account[] = [];
  tableData: any[] = [];

  constructor(private accountService: AccountsService, private router: Router) {}

  ngOnInit(): void {
    this.accountService.getAccounts().subscribe((res) => {
      console.log("accounts:::");
      this.tableData = <Account[]>res.responseData;
    });
  }

  public addAccount(account: Account) {
    console.log("navigate to account edit...");
    this.router.navigate(["account"]);
  }

  tableColumns: TableColumn[] = [
    { key: "id", label: "ID", sortable: true },
    { key: "name", label: "Name", sortable: true },
    { key: "accountType", label: "Account Type", sortable: true },
    { key: "user", label: "User", sortable: true },
    { key: "url", label: "URL", sortable: true },
    { key: "description", label: "Description", sortable: true },
  ];

  public rowClicked(account: Account) {
    if (account.id) {
      this.router.navigate([`accounts/account/${account.id}`]);
    } else {
      this.router.navigate(["account"]);
    }
  }
}

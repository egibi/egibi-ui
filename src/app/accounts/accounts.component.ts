import { Component, OnInit, ViewChild, inject, signal, WritableSignal, TemplateRef } from "@angular/core";
import { Router } from "@angular/router";
import { EgibiTableComponent } from "../_components/egibi-table/egibi-table.component";
import { Account } from "../_models/account.model";
import { AccountsService } from "./accounts.service";
import { TableColumn } from "../_components/egibi-table/egibi-table.models";
import { AccountsTopActionsComponent } from "./accounts-top-actions/accounts-top-actions.component";
import { NgbGlobalModalService } from "../_services/ngb-global-modal.service";
import { CreateAccountModalComponent } from "./modal-components/create-account-modal/create-account-modal.component";
import { AccountType } from "../_models/account-type";

@Component({
  selector: "accounts",
  standalone: true,
  imports: [EgibiTableComponent, AccountsTopActionsComponent],
  templateUrl: "./accounts.component.html",
  styleUrl: "./accounts.component.scss",
})
export class AccountsComponent implements OnInit {
  accounts: Account[] = [];
  accountTypes: AccountType[] = [];
  tableData: any[] = [];

  constructor(private accountService: AccountsService, private router: Router, private modalService: NgbGlobalModalService) {}

  ngOnInit(): void {
    this.accountService.getAccounts().subscribe((res) => {
      console.log("accounts:::");
      this.tableData = <Account[]>res.responseData;
    });

    this.accountService.getAccountTypes().subscribe((res) => {
      console.log("accountTypes:::");
      this.accountTypes = res.responseData;
    })
  }

  public addAccount(account: Account) {
    // console.log("navigate to account edit...");
    // this.router.navigate(["account"]);
    // TODO: Load modal and create empty new account
  }

  tableColumns: TableColumn[] = [
    { key: "id", label: "ID", sortable: true },
    { key: "name", label: "Name", sortable: true },
    { key: "accountType", label: "Account Type", sortable: true },
    { key: "user", label: "User", sortable: true },
    { key: "url", label: "URL", sortable: true },
    { key: "description", label: "Description", sortable: true },
  ];

  // modal result
  lastResult: any = null;

  public openAccountCreateModal(event: any): void {
    console.log("open account create modal:::");
    console.log("event data: ", event);
    this.modalService
      .openModal(
        CreateAccountModalComponent,
        { size: "lg", centered: true },
        {
          title: "Create Account",
          accountTypes: this.accountTypes
        }
      )
      .subscribe((result) => {
        this.lastResult = result;
        console.log("create account confirmation result:", result);
      });
  }

  public rowClicked(account: Account) {
    if (account.id) {
      this.router.navigate([`accounts/account/${account.id}`]);
    } else {
      this.router.navigate(["account"]);
    }
  }
}

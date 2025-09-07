import { Component, OnInit, ViewChild } from "@angular/core";
import { EgibiTableComponent } from "../../../_components/egibi-table/egibi-table.component";
import { TableColumn } from "../../../_components/egibi-table/egibi-table.models";
import { ToastService } from "../../../_services/toast.service";
import { ToastComponent } from "../../../_components/toast/toast.component";
import { AccountUser } from "../../../_models/account-user.model";
import { AppConfigurationService } from "../../app-configuration.service";
import { NgbGlobalModalService } from "../../../_services/ngb-global-modal.service";
import { CreateAccountUserModalComponent } from "../../modal-components/account-users-modals/create-account-user-modal/create-account-user-modal.component";
import { EditAccountUserComponent } from "../../modal-components/account-users-modals/edit-account-user/edit-account-user.component";

@Component({
  selector: "account-users",
  standalone: true,
  imports: [EgibiTableComponent, ToastComponent],
  templateUrl: "./account-users.component.html",
  styleUrl: "./account-users.component.scss",
})
export class AccountUsersComponent implements OnInit {
  @ViewChild(EgibiTableComponent) accountUserTable: EgibiTableComponent;
  accountUsers: AccountUser[] = [];

  resultsTableColumns: TableColumn[] = [
    { key: "id", label: "ID", sortable: true },
    { key: "email", label: "Email", sortable: true },
    { key: "firstName", label: "First Name", sortable: true },
    { key: "lastName", label: "Last Name", sortable: true },
    { key: "phoneNumber", label: "Phone #", sortable: true },
  ];

  constructor(private toastService: ToastService, private configService: AppConfigurationService, private modalService: NgbGlobalModalService) {}
  ngOnInit(): void {
    this.configService.getAccountUsers().subscribe((res) => {
      this.accountUsers = res.responseData;
      console.log("account users:::");
      console.log(this.accountUsers);
    });
  }

  //===============================================================================
  // HANDLE ADDING NEW ACCOUNT USER TO TABLE
  //===============================================================================
  public addNewAccountUser(event: any): void {
    this.modalService.openModal(CreateAccountUserModalComponent, { size: "lg", centered: true }, { title: "Create Account User" }).subscribe((result) => {
      if (result) {
        this.createAccountUser(result.result);
      }
    });
  }

  public createAccountUser(result: any): void {
    let accountUser: AccountUser = new AccountUser();

    accountUser.email = result.email;
    accountUser.firstName = result.firstName;
    accountUser.lastName = result.lastName;
    accountUser.phoneNumber = result.phoneNumber;
    accountUser.isActive = result.isActive;

    this.configService.saveAccountUser(accountUser).subscribe((res) => {
      console.log("saved account user:::");
      console.log(res);
    });
  }

  //===============================================================================
  // HANDLE EDITING ACCOUNT USER (MODAL)
  //===============================================================================

  public editAccountUser(accountUser:AccountUser): void {
    this.modalService
    .openModal(EditAccountUserComponent,
      {size:"lg", centered:true},
      {
        title: `Edit Account User`,
        accountUser: accountUser
      }
    )
    .subscribe((result:any) => {
      console.log('EditAccountUserModalComponent ==> ');
      console.log(result);
    });
  }

  public deleteAccountUser(event: any): void {
    console.log("delete account user...");
  }

}

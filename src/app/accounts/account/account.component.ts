import { Component, OnInit, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbNavModule } from "@ng-bootstrap/ng-bootstrap";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AccountsService } from "../accounts.service";
import { EntityType } from "../../_models/entity-type.model";
import { FeesComponent } from "./account-sections/fees/fees.component";
import { AccountDetailsComponent } from "./account-sections/account-details/account-details.component";
import { AccountsBottomActionsComponent } from "../accounts-bottom-actions/accounts-bottom-actions.component";
import { ApiComponent } from "./account-sections/api/api.component";
import { StatusComponent } from "./account-sections/status/status.component";

@Component({
  selector: "account",
  imports: [ReactiveFormsModule, CommonModule, NgbNavModule, AccountDetailsComponent, AccountsBottomActionsComponent],
  templateUrl: "./account.component.html",
  styleUrl: "./account.component.scss",
})
export class AccountComponent implements OnInit {
  @ViewChild(AccountDetailsComponent) accountDetails: AccountDetailsComponent;
  @ViewChild(ApiComponent) accountApi: ApiComponent;
  @ViewChild(FeesComponent) accountFees: FeesComponent;
  @ViewChild(StatusComponent) accountStatus: StatusComponent;

  public accountDetailsForm: FormGroup;
  public accountApiForm: FormGroup;
  public accountFeesForm: FormGroup;
  public accountStatusForm: FormGroup;

  public activeTab = "details";
  accountId: number;

  accountForm: FormGroup;
  accountTypes: EntityType[] = [];

  constructor(private route: ActivatedRoute, private fb: FormBuilder, private router: Router, private accountsService: AccountsService) {}

  ngOnInit(): void {
    this.accountId = Number(this.route.snapshot.params["id"]);
    console.log("got id of: ", this.accountId);

    if (this.accountId) {
      // TODO: load existing account data
      console.log("should get account data:::");
      this.accountsService.getAccount(this.accountId).subscribe((res) => {
        console.log("got account data:::");
        console.log(res);
      });
    } else {
      //TODO: this is a new account creation
      console.log("we are creating a new account");
    }
  }

  //========================================================
  // Bottom Action Handlers ================================
  public handleSave(event: any, activeTab: string): void {
    console.log("handle save for active tab:::", activeTab);

    switch (activeTab) {
      case "details":

        let detailsFormValues = this.accountDetails.accountDetailsForm.form.value;

        let isValid = this.accountDetails.accountDetailsForm.form.valid;

        if(isValid){
          console.log('form is valid');
        }else{
          console.log('form contains validation errors');
        }

        console.log('details form values:::');
        console.log(detailsFormValues);
        console.log("save details");
        break;
      case "security":
        console.log("save security");
        break;
      case "api":
        console.log("save api");
        break;
      case "fees":
        console.log("save fees");
        break;
      case "status":
        console.log("save status");
        break;
    }
  }

  public handleCancel(event: any): void {
    console.log("canceling account edit:::");
    this.router.navigate(["accounts"]);
  }

  public handleDelete(event: any): void {
    console.log("deleting account:::");
  }
  //========================================================

  public setActiveTab(tabId: string) {
    this.activeTab = tabId;
    console.log("selected tab:::", this.activeTab);
  }
}

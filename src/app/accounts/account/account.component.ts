import { Component, OnInit, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbNavModule } from "@ng-bootstrap/ng-bootstrap";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AccountsService } from "../accounts.service";
import { EntityType } from "../../_models/entity-type.model";
import { FeesComponent } from "./sections/fees/fees.component";
import { AccountDetailsComponent } from "./sections/account-details/account-details.component";
import { AccountsBottomActionsComponent } from "../accounts-bottom-actions/accounts-bottom-actions.component";
import { ApiComponent } from "./sections/api/api.component";
import { StatusComponent } from "./sections/status/status.component";
import { Account } from "../../_models/account.model";

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

  ngOnInit(): void {}

  //=============================================================
  // Try with no existing accounts to create a new one
  //=============================================================
  public handleSave(activeTab: string, isNewAccount: boolean): void {
    const newAccount = this.accountDetails.accountDetailsForm.form.value;
    this.accountsService.saveAccount(newAccount).subscribe((res) => {
      console.log('attempted save:::');
      console.log(res);
    });
  }

  public handleCancel(event: any) {
    console.log("handle cancel:::");
    console.log("cancel event ==> ", event);
  }

  public handleDelete(event: any) {
    console.log("handle delete:::");
    console.log("delete event ==> event");
  }

  public setActiveTab(tabId: string) {
    this.activeTab = tabId;
    console.log("selected tab:::", this.activeTab);
  }
}

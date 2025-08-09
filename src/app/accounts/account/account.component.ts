import { Component, OnInit, ViewChild, inject, signal, WritableSignal, TemplateRef } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbModal, NgbNavModule } from "@ng-bootstrap/ng-bootstrap";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { AccountsService } from "../accounts.service";
import { EntityType } from "../../_models/entity-type.model";
import { FeesComponent } from "./account-sections/fees/fees.component";
import { AccountDetailsComponent } from "./account-sections/account-details/account-details.component";
import { AccountsBottomActionsComponent } from "../accounts-bottom-actions/accounts-bottom-actions.component";
import { ApiComponent } from "./account-sections/api/api.component";
import { StatusComponent } from "./account-sections/status/status.component";
import { EgibiModalComponent } from "../../egibi-modal/egibi-modal.component";
import { ModalService } from "../../_services/modal.service";
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

  public activeTabIndex = 0;
  accountId: number;

  accountForm: FormGroup;
  accountTypes: EntityType[] = [];

  constructor(private route: ActivatedRoute, private fb: FormBuilder, private router: Router, private accountsService: AccountsService, private modalService: ModalService) {}

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
    }

    this.accountForm = this.fb.group({
      id: [""],
      name: [""],
      description: [""],
      notes: [""],
      isActive: [""],
      lastModifiedAt: [""],
    });
  }

  //========================================================
  // Bottom Action Handlers ================================
  public handleSave(event: any): void {
    let account = this.accountDetails.getAccountDetails();
    this.accountsService.saveAccount(account).subscribe((res) => {
      console.log("save account response:::");
      console.log(res);
    });

    //TODO: Go back when OK'ed
    //this.router.navigate(["accounts"]);
  }

  public handleCancel(event: any): void {
    console.log("canceling account edit:::");
    this.router.navigate(["accounts"]);
  }

  public handleDelete(event: any): void {
    console.log("deleting account:::");
  }
  //========================================================

  
}

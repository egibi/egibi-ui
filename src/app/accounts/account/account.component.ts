import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbNavModule } from "@ng-bootstrap/ng-bootstrap";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { AccountsService } from "../accounts.service";
import { EntityType } from "../../_models/entity-type.model";
import { FeesComponent } from "./account-sections/fees/fees.component";
import { AccountDetailsComponent } from "./account-sections/account-details/account-details.component";
import { AccountsBottomActionsComponent } from "../accounts-bottom-actions/accounts-bottom-actions.component";

@Component({
  selector: "account",
  imports: [ReactiveFormsModule, CommonModule, NgbNavModule, AccountDetailsComponent, FeesComponent, AccountsBottomActionsComponent],
  templateUrl: "./account.component.html",
  styleUrl: "./account.component.scss",
})
export class AccountComponent implements OnInit {
  public activeTabIndex = 0;

  accountForm: FormGroup;
  accountTypes: EntityType[] = [];

  constructor(private route: ActivatedRoute, private fb: FormBuilder, private router: Router, private accountsService: AccountsService) {}

  ngOnInit(): void {
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
    console.log("saving account:::");

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

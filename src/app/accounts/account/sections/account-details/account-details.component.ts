import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, FormControl, Validators } from "@angular/forms";
import { AccountType } from "../../../../_models/account-type";
import { AccountDetailsFormComponent } from "./account-details-form/account-details-form.component";
import { AppConfigurationService } from "../../../../app-configuration/app-configuration.service";
import { AccountsService } from "../../../accounts.service";

@Component({
  selector: "account-details",
  imports: [ReactiveFormsModule, CommonModule, AccountDetailsFormComponent],
  templateUrl: "./account-details.component.html",
  styleUrl: "./account-details.component.scss",
})
export class AccountDetailsComponent implements OnInit {
  @ViewChild(AccountDetailsFormComponent) accountDetailsForm: AccountDetailsFormComponent;
  accountTypes:AccountType[] = [];


  constructor(private fb:FormBuilder, private accountService:AccountsService){}

  ngOnInit(): void {
    // Get available AccountTypes
    this.accountService.getAccountTypes().subscribe((res) => {
      this.accountTypes = res.responseData;
    });
  }
}

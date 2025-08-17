import { Component, OnInit, Input, ViewChild } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, FormControl, Validators } from "@angular/forms";
import { AccountType } from "../../../../_models/account-type";
import { AccountDetailsFormComponent } from "./account-details-form/account-details-form.component";

@Component({
  selector: "account-details",
  imports: [ReactiveFormsModule, CommonModule, AccountDetailsFormComponent],
  templateUrl: "./account-details.component.html",
  styleUrl: "./account-details.component.scss",
})
export class AccountDetailsComponent implements OnInit {
  @ViewChild(AccountDetailsFormComponent) accountDetailsForm: AccountDetailsFormComponent;

  @Input() accountTypes: AccountType[] = [
    { id: 1, name: "Cryptocurrency", order: 0 },
    { id: 2, name: "Stocks", order: 1 },
    { id: 3, name: "Credit", order: 2 },
    { id: 4, name: "Loan", order: 3 },
  ];

  constructor(private fb: FormBuilder) {}
  ngOnInit(): void {}
}

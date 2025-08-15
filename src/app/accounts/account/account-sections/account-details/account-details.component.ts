import { Component, OnInit, Input } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, FormControl, Validators } from "@angular/forms";
import { AccountType } from "../../../../_models/account-type";
import { Account } from "../../../../_models/account.model";

@Component({
  selector: "account-details",
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: "./account-details.component.html",
  styleUrl: "./account-details.component.scss",
})
export class AccountDetailsComponent implements OnInit {
  @Input() accountTypes: AccountType[] = [
    { id: 1, name: "Cryptocurrency", order: 0 },
    { id: 2, name: "Stocks", order: 1 },
    { id: 3, name: "Credit", order: 2 },
    { id: 4, name: "Loan", order: 3 },
  ];

  form: FormGroup;

  constructor(private fb: FormBuilder) {}
  ngOnInit(): void {
    this.form = this.fb.group({
      name: ["", [Validators.required]],
      description: ["", [Validators.required]],
      accountType: [null, [Validators.required]],
      user: ["", [Validators.required]],
      url: ["", Validators.required],
    });
  }

  public getAccountDetails(): Account {
    let accountDetails: Account = this.form.value;
    return accountDetails;
  }

  public onAccountTypeSelected(): void {
    let selectedAccountType = this.form.get("accountType")?.value as AccountType;
  }
}

import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule, FormControl } from "@angular/forms";
import { AccountsActionBarComponent } from "../../../accounts-action-bar/accounts-action-bar.component";
import { AccountType } from "../../../../_models/account-type";

@Component({
  selector: "account-details",
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: "./account-details.component.html",
  styleUrl: "./account-details.component.scss",
})
export class AccountDetailsComponent implements OnInit {

  form: FormGroup;
  accountTypes: AccountType[] = [
    {id:1, name: 'Cryptocurrency', order: 0},
    {id:2, name: 'Stocks', order: 1},
    {id:3, name: 'Credit', order: 2},
    {id:4, name: 'Loan', order: 3},
  ];


  constructor(private fb: FormBuilder) {}
  ngOnInit(): void {
    this.form = this.fb.group({
      name: [''],
      description:[''],
      accountType:[null],
      accountUser:[''],
      url: [''],
    });
  }

  public onAccountTypeSelected():void{
    console.log('account type selected...');
    let selectedAccountType = this.form.get('accountType')?.value as AccountType;
    console.log(selectedAccountType);
    
  }
}

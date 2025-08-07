import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, ReactiveFormsModule, FormsModule } from "@angular/forms";
import { EgibiTableComponent } from "../_components/egibi-table/egibi-table.component";
import { Account } from "../_models/account.model";
import { AccountsService } from "./accounts.service";
import { EgibiTableColumn } from "../_components/egibi-table/egibi-table.models";

@Component({
  selector: "accounts",
  imports: [ReactiveFormsModule, FormsModule, EgibiTableComponent],
  templateUrl: "./accounts.component.html",
  styleUrl: "./accounts.component.scss",
})
export class AccountsComponent implements OnInit {
  // TODO: Test version
  public accountTypes: string[] = ["Crypto Exchange", "Market"];

  public tableColumns: EgibiTableColumn[] = [
    {name: "Account Name", width:"auto"},
    {name: "URL", width:"auto"},
    {name: "Username", width:"auto"},
    {name: "Account Type", width:"auto"},
    {name: "Equity", width:"auto"}

  ]

  constructor(private route: ActivatedRoute, private fb: FormBuilder, private router: Router, private accountsService: AccountsService) {}

  ngOnInit(): void {}

  public addNew(): void {
    this.router.navigate(["account"]);
  }

  public delete(): void {
    console.log("deleting...");
  }

  public onRowSelect(e: any) {
    console.log("row selected...");
  }
}

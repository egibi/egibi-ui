import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { FormBuilder, ReactiveFormsModule, FormsModule } from "@angular/forms";
import { EgibiTableComponent } from "../_components/egibi-table/egibi-table.component";
import { Account } from "../_models/account.model";
import { AccountsService } from "./accounts.service";
import { TableColumn } from "../_components/egibi-table/egibi-table.models";
import { RequestResponse } from "../request-response";
import { AccountsActionBarComponent } from "./accounts-action-bar/accounts-action-bar.component";
import { AccountsTopActionsComponent } from "./accounts-top-actions/accounts-top-actions.component";

@Component({
  selector: "accounts",
  imports: [EgibiTableComponent, AccountsTopActionsComponent],
  templateUrl: "./accounts.component.html",
  styleUrl: "./accounts.component.scss",
})
export class AccountsComponent implements OnInit {

accounts: Account[] = [];

constructor(private accountService:AccountsService, private router:Router){

}

ngOnInit(): void {
  this.accountService.getAccounts().subscribe((res) => {
    console.log('accounts:::');
    console.log(<RequestResponse>res.responseData);
  });

}

public addAccount(event:any){
  console.log('navigate to account edit...');
  this.router.navigate(["account"]);
}

  tableColumns: TableColumn[] = [
    { key: 'id', label: 'ID', sortable: true },
    { key: 'name', label: 'Name', sortable: true },
    { key: 'email', label: 'Email', sortable: true },
    { key: 'age', label: 'Age', sortable: true },
    { key: 'department', label: 'Department', sortable: true },
    { key: 'salary', label: 'Salary', sortable: true },
    { key: 'status', label: 'Status', sortable: false } // Non-sortable column
  ];

    tableData = [
    { id: 1, name: 'John Doe', email: 'john@example.com', age: 30, department: 'Engineering', salary: 75000, status: 'Active' },
    { id: 2, name: 'Jane Smith', email: 'jane@example.com', age: 28, department: 'Marketing', salary: 65000, status: 'Active' },
    { id: 3, name: 'Bob Johnson', email: 'bob@example.com', age: 35, department: 'Sales', salary: 70000, status: 'Inactive' },
    { id: 4, name: 'Alice Brown', email: 'alice@example.com', age: 32, department: 'Engineering', salary: 80000, status: 'Active' },
    { id: 5, name: 'Charlie Wilson', email: 'charlie@example.com', age: 29, department: 'HR', salary: 60000, status: 'Active' }
  ];
}

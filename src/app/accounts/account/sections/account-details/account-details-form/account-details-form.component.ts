import { Component, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AccountType } from "../../../../../_models/account-type";
import { ActivatedRoute } from "@angular/router";

@Component({
  selector: "account-details-form",
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: "./account-details-form.component.html",
  styleUrl: "./account-details-form.component.scss",
})
export class AccountDetailsFormComponent implements OnInit {
   @Input() accountTypes: AccountType[] = [];
 
   isNewAccount:boolean = false;
   
  form: FormGroup;

  constructor(private route:ActivatedRoute, private fb: FormBuilder) {}

  ngOnInit(): void {

    const urlSegments = this.route.snapshot.url;
    const lastSegment = urlSegments[urlSegments.length - 1]?.path;

    if(lastSegment === "create")
      this.isNewAccount = true;

    console.log('route path:::');
    console.log(lastSegment);

    this.form = this.fb.group({
      name: ["", [Validators.required]],
      user: ["", [Validators.required]],
      accountTypeId: ["", [Validators.required]],
      url: ["", [Validators.required]],
    });
  }
}

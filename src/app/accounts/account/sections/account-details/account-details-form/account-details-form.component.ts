import { Component, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { AccountType } from "../../../../../_models/account-type";

@Component({
  selector: "account-details-form",
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
  templateUrl: "./account-details-form.component.html",
  styleUrl: "./account-details-form.component.scss",
})
export class AccountDetailsFormComponent implements OnInit {
  @Input() accountTypes: AccountType[] = [];
  form: FormGroup;

  constructor(private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ["", [Validators.required]],
      user: ["", [Validators.required]],
      // accountType: ["", [Validators.required]],
      accountTypeId: [""],
      url: ["", [Validators.required]],
    });
  }
}

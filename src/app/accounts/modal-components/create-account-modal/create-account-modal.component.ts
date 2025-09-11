import { Component, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ReactiveFormsModule, FormGroup, FormControl, FormBuilder, Validators } from "@angular/forms";
import { AccountType } from "../../../_models/account-type";

@Component({
  selector: "create-account-modal",
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./create-account-modal.component.html",
  styleUrl: "./create-account-modal.component.scss",
})
export class CreateAccountModalComponent implements OnInit {
  @Input() title?: string;
  @Input() accountTypes: AccountType[] = [];

  form: FormGroup;

  constructor(public activeModal: NgbActiveModal, private fb: FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      name: ["", [Validators.required]],
      accountTypeId: ["", Validators.required],
      active: [""],
    });
  }

  dismiss(dismissedReason: string): void {
    this.activeModal.dismiss(dismissedReason);
  }

  confirm(result: string): void {
    if (this.form.valid) {
      if (result === "save as new") {
        console.log("create new blank account record:::");
        // use accountService to create new account
        // if no accountType is selected, default to unknown
        // close modal and update table with new account
      }
      if (result === "save and continue") {
        console.log("create new blank account record then navigate to new account by id where it should default to details tab:::");
        // use accountSerivce to create new account
        // if no accountType is selected, default to unknown
        // get id of newly created account 
        // navigate to account route where it should default to 'details' tab
      }
    } else {
      console.log("handle invalid form:::");
    }

    // this.activeModal.close({ formData: this.form.value });
  }
}

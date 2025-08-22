import { Component, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";
import { ReactiveFormsModule, FormGroup, FormControl, FormBuilder } from "@angular/forms";
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
      name: [""],
      accountType: [""],
      active: [""],
    });
  }

  dismiss(dismissedReason:string):void{
    this.activeModal.dismiss(dismissedReason);
  }

  confirm(): void {
    this.activeModal.close({formData:this.form.value}); 

  }
}

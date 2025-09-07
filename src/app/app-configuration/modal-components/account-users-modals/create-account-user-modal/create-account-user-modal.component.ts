import { Component, Input, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule } from "@angular/forms";
import { NgbActiveModal } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "create-account-user-modal",
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: "./create-account-user-modal.component.html",
  styleUrl: "./create-account-user-modal.component.scss",
})
export class CreateAccountUserModalComponent implements OnInit {
  @Input() title?: string;
  form: FormGroup;

  constructor(public activeModal: NgbActiveModal, private fb:FormBuilder) {}

  ngOnInit(): void {
    this.form = this.fb.group({
      id:[""],
      email:[""],
      firstName: [""],
      lastName:[""],
      phoneNumber:[""] ,
      isActive:[]    
    });
  }

  public dismiss(dismissedreason:string):void{
    this.activeModal.dismiss(dismissedreason);
  }

  confirm():void{
    this.activeModal.close(this.form.value);
  }
}

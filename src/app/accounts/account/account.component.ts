import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbNavModule } from "@ng-bootstrap/ng-bootstrap";
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from "@angular/forms";
import { AccountsService } from "../accounts.service";
import { EntityType } from "../../_models/entity-type.model";





@Component({
  selector: "account",
  imports: [ReactiveFormsModule, FormsModule, CommonModule, NgbNavModule],
  templateUrl: "./account.component.html",
  styleUrl: "./account.component.scss",
})
export class AccountComponent implements OnInit {
  
  accountForm: FormGroup;
  accountTypes: EntityType[] = [];
  
  constructor(private route: ActivatedRoute, private fb: FormBuilder, private router: Router, private accountsService: AccountsService) {}

  ngOnInit(): void {



    this.accountForm = this.fb.group({
      id: [""],
      name: [""],
      description: [""],
      notes: [""],
      isActive: [""],
      lastModifiedAt: [""]
    });
  }

  public save():void{

    //TODO: Go back when OK'ed
    //this.router.navigate(["accounts"]);
  }
  
  public cancel():void{
    this.router.navigate(["accounts"]);
  }

}

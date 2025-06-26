import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, RouterModule, Router } from "@angular/router";
import { NgbNavModule } from "@ng-bootstrap/ng-bootstrap";
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from "@angular/forms";

@Component({
  selector: "admin",
  imports: [ReactiveFormsModule, FormsModule, NgbNavModule],
  templateUrl: "./admin.component.html",
  styleUrl: "./admin.component.scss",
})
export class AdminComponent {
  public active = 1;

  constructor(private router: Router, private route: ActivatedRoute, private fb: FormBuilder) {}
}

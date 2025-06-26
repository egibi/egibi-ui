import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, RouterModule, Router } from "@angular/router";
import { NgbNavModule } from "@ng-bootstrap/ng-bootstrap";
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from "@angular/forms";
import { FeesComponent } from "./tabs/fees/fees.component";

@Component({
  selector: "configuration",
  imports: [ReactiveFormsModule, FormsModule, NgbNavModule, FeesComponent],
  templateUrl: "./configuration.component.html",
  styleUrl: "./configuration.component.scss",
})
export class ConfigurationComponent {
  public active = 1;

  constructor(private router: Router, private route: ActivatedRoute, private fb: FormBuilder) {}
}

import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, RouterModule, Router } from "@angular/router";
import { NgbNavModule } from "@ng-bootstrap/ng-bootstrap";
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from "@angular/forms";
import { FeesComponent } from "./tabs/fees/fees.component";
import { EntityTypesComponent } from "./tabs/entity-types/entity-types.component";

@Component({
  selector: "configuration",
  imports: [ReactiveFormsModule, FormsModule, NgbNavModule, FeesComponent, EntityTypesComponent],
  templateUrl: "./configuration.component.html",
  styleUrl: "./configuration.component.scss",
})
export class ConfigurationComponent {
  public active = 1;

  constructor(private router: Router, private route: ActivatedRoute, private fb: FormBuilder) {}
}

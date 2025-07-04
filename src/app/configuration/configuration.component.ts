import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbNavModule } from "@ng-bootstrap/ng-bootstrap";
import { FormBuilder, ReactiveFormsModule, FormsModule } from "@angular/forms";
import { FeesComponent } from "./tabs/fees/fees.component";
import { EntityTypesComponent } from "./tabs/entity-types/entity-types.component";

@Component({
  selector: "configuration",
  imports: [ReactiveFormsModule, FormsModule, NgbNavModule, FeesComponent, EntityTypesComponent],
  templateUrl: "./configuration.component.html",
  styleUrl: "./configuration.component.scss",
})
export class ConfigurationComponent implements OnInit {
  public active = 1;

  ngOnInit(): void {}

  constructor(private router: Router, private route: ActivatedRoute, private fb: FormBuilder) {}
}

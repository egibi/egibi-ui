import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbNavModule } from "@ng-bootstrap/ng-bootstrap";
import { FormBuilder, ReactiveFormsModule, FormsModule } from "@angular/forms";
import { FeesComponent } from "./tabs/fees/fees.component";
import { EntityTypesComponent } from "./tabs/entity-types/entity-types.component";
import { EgibiTableComponent } from "../_components/egibi-table/egibi-table.component";
import { ExchangesComponent } from "../exchanges/exchanges.component";


@Component({
  selector: "service-configurations",
  imports: [ReactiveFormsModule, FormsModule, NgbNavModule, FeesComponent, EntityTypesComponent, EgibiTableComponent, ExchangesComponent],
  templateUrl: "./service-configurations.component.html",
  styleUrl: "./service-configurations.component.scss",
})
export class ServiceConfigurationsComponent implements OnInit {
  public active = 1;

  ngOnInit(): void {}

  constructor(private router: Router, private route: ActivatedRoute, private fb: FormBuilder) {}
}

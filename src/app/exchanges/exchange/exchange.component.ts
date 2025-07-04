import { CommonModule } from "@angular/common";
import { Component, OnInit } from "@angular/core";
import { ActivatedRoute, Router } from "@angular/router";
import { NgbNavModule } from "@ng-bootstrap/ng-bootstrap";
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from "@angular/forms";
import { Exchange } from "../../_models/exchange.model";
import { ExchangesService } from "../exchanges.service";
import { ExchangeAccount } from "../../_models/exchange-account.model";
import { ExchangeDetailsComponent } from "./tabs/exchange-details/exchange-details.component";
import { ExchangeFeesComponent } from "./tabs/exchange-fees/exchange-fees.component";


@Component({
  selector: "exchange",
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, NgbNavModule, ExchangeDetailsComponent, ExchangeFeesComponent],
  templateUrl: "./exchange.component.html",
  styleUrl: "./exchange.component.scss",
})
export class ExchangeComponent implements OnInit {
  public exchangeID: number;
  public exchanges: Exchange[] = [];
  public exchangeAccounts: ExchangeAccount [] = [];
  public exchangeDetailsForm: FormGroup;

  public active = 1;

  constructor(private route: ActivatedRoute, private fb: FormBuilder, private router: Router, private exchangeService: ExchangesService) {
    this.exchangeDetailsForm = this.fb.group({
      id: [""],
      exchangeTypeId: [""],
      name: [""],
      description: [""],
      notes: ["",]
    });
  }

  public ngOnInit(): void {
    this.exchangeID = Number(this.route.snapshot.paramMap.get("id")); // TODO: Probably don't need this
   
    this.exchangeDetailsForm.get("id")?.setValue(this.exchangeID);
    this.exchangeService.getExchange(this.exchangeID).subscribe((res) => {
      if (res) this.exchangeDetailsForm.patchValue(res.responseData);
    });

    // this.exchangeService.
  }

  public save(): void {
    const exchange: Exchange = this.exchangeDetailsForm.value as Exchange;

    // Optional way (stricter/safer mapping)
    // const exchangeFormValues = this.exchangeDetailsForm.value;
    // const exchange: Exchange = {
    //   id: exchangeFormValues.id,
    //   name: exchangeFormValues.name,
    //   description: exchangeFormValues.description
    // };

    this.exchangeService.saveExchange(exchange).subscribe((res) => {
      console.log("exchange saved...");
      console.log(res);
    });

    this.router.navigate(["exchanges"]);
  }

  public cancel(): void {
    this.router.navigate(["exchanges"]);
  }
}

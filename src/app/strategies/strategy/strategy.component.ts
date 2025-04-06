import { Component, OnInit } from "@angular/core";
import { StrategiesService } from "../strategies.service";
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";

@Component({
  selector: "strategy",
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: "./strategy.component.html",
  styleUrl: "./strategy.component.scss",
})
export class StrategyComponent implements OnInit {
  public strategyDetailsForm: FormGroup;

  constructor(private fb: FormBuilder, private strategiesService: StrategiesService) {
    this.strategyDetailsForm = this.fb.group({
      strategyID: [""],
      name: [""],
      description: [""],
      instanceName: [""],
    });
  }

  ngOnInit(): void {
    this.strategyDetailsForm.patchValue(this.strategiesService.getSelectedStrategy());
  }
}

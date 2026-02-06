// FILE: egibi-ui/src/app/strategies/strategy/strategy.component.ts

import { Component, OnInit } from "@angular/core";
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

  constructor(private fb: FormBuilder) {
    this.strategyDetailsForm = this.fb.group({
      strategyId: [""],
      name: [""],
      description: [""],
      instanceName: [""],
    });
  }

  ngOnInit(): void {
    // Form is initialized with empty values for create mode.
    // Parent component can patch values for edit mode if needed.
  }
}

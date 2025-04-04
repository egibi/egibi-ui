import { Component, OnInit, Input, Output, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, FormsModule } from "@angular/forms";
import { SelectOption } from "../../_models/select-option.model";

@Component({
  selector: "backtest-params",
  imports: [CommonModule, ReactiveFormsModule, FormsModule],
  templateUrl: "./backtest-params.component.html",
  styleUrl: "./backtest-params.component.scss",
})
export class BacktestParamsComponent implements OnInit {
  @Input() dataSources: SelectOption[] = [];

  paramsForm: FormGroup;
  constructor(private fb: FormBuilder) {
    this.paramsForm = this.fb.group({
      backtestID: [""],
      dataSourceID: [""],
      start: [""],
      end: [""],
    });
  }

  ngOnInit(): void {}
}

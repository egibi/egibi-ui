import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from "@angular/forms";
import { HighchartsTimeSeriesComponent } from "../../../_charts/highcharts-time-series/highcharts-time-series.component";
@Component({
  selector: "backtest-setup",
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, CommonModule, HighchartsTimeSeriesComponent],
  templateUrl: "./backtest-setup.component.html",
  styleUrl: "./backtest-setup.component.scss",
})
export class BacktestSetupComponent implements OnInit {
  public backtestSetupForm: FormGroup;

  // TODO: LOAD REAL SELECT OPTIONS------------
  public historicalDataSources: any[] = [
    { name: "Coinbase", value: 1 },
    { name: "Alpaca", value: 2 },
    { name: "Binance US", value: 3 },
  ];

  public strategies: any[] = [
    { name: "TestStrategy_01", value: 1 },
    { name: "TestStrategy_02", value: 2 },
    { name: "TestStrategy_03", value: 3 },
  ];
  //------------------------------------------

  constructor(private fb: FormBuilder) {
    this.backtestSetupForm = this.fb.group({
      datasource: [""],
      strategy: [""],
      start: [""],
      end: [""],
    });
  }

  ngOnInit(): void {}
}

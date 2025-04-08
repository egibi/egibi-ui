import { Component, OnInit, ViewChild, signal, WritableSignal } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, FormsModule } from "@angular/forms";
import { BacktestParamsComponent } from "./backtest-params/backtest-params.component";
import { BacktesterService } from "./backtester.service";
import { SelectOption } from "../_models/select-option.model";
import { BacktestsGridComponent } from "./backtests-grid/backtests-grid.component";
import { Backtest } from "./backtester.models";
import { BacktestComponent } from "./backtest/backtest.component";

@Component({
  selector: "backtester",
  imports: [CommonModule, ReactiveFormsModule, FormsModule, BacktestComponent, BacktestParamsComponent, BacktestsGridComponent],
  templateUrl: "./backtester.component.html",
  styleUrl: "./backtester.component.scss",
})
export class BacktesterComponent implements OnInit {
  @ViewChild(BacktestsGridComponent) backtestsGridComponent: BacktestsGridComponent;
  @ViewChild(BacktestComponent) backtestComponent: BacktestComponent;

  public selectedBacktest:Backtest;  
  closeResult: WritableSignal<string> = signal("");
  public rowData: Backtest[] = [];
  public dataSources: SelectOption[] = [];


  constructor(private fb: FormBuilder, private backtesterService: BacktesterService) {}

  ngOnInit(): void {
    this.backtesterService.getDataSources().subscribe((res) => {
      console.log("getting data sources....");
      this.dataSources = res.responseData;
      console.log(this.dataSources);
    });
  }

  public onActionSelect(e: any): void {
    console.log("action selected....");
  }
}

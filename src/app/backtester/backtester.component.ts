import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, FormsModule } from "@angular/forms";
import { BacktestParamsComponent } from "./backtest-params/backtest-params.component";
import { BacktesterService } from "./backtester.service";
import { SelectOption } from "../_models/select-option.model";

@Component({
  selector: "backtester",
  imports: [CommonModule, ReactiveFormsModule, FormsModule, BacktestParamsComponent],
  templateUrl: "./backtester.component.html",
  styleUrl: "./backtester.component.scss",
})
export class BacktesterComponent implements OnInit {
  private apiBaseUrl: string = "";
  public dataSources: SelectOption[] = [];

  constructor(private fb: FormBuilder, private backtesterService:BacktesterService) {}

  ngOnInit(): void {
    this.backtesterService.getDataSources().subscribe((res) => {
      console.log('getting data sources....');
      this.dataSources = res.responseData;
      console.log(this.dataSources);
    });
  }
}

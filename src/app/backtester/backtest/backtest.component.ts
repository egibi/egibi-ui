import { Component, OnInit } from "@angular/core";
import { BacktesterService } from "../backtester.service";
import { FormBuilder, FormGroup, FormControl, ReactiveFormsModule, FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";

@Component({
  selector: "backtest",
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  templateUrl: "./backtest.component.html",
  styleUrl: "./backtest.component.scss",
})
export class BacktestComponent implements OnInit {
  public backtestDetailsForm: FormGroup;

  constructor(private fb: FormBuilder, private backtesterService: BacktesterService) {
    this.backtestDetailsForm = this.fb.group({
      backtestID: [""],
      name: [""],
      description: [""],
    });
  }

  ngOnInit(): void {
    this.backtestDetailsForm.patchValue(this.backtesterService.getSelectedBacktest());
  }
}

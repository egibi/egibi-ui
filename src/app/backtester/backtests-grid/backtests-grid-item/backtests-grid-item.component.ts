import { Component, OnInit } from "@angular/core";
import { BacktesterService } from "../../backtester.service";
import { FormBuilder, FormGroup, ReactiveFormsModule, FormsModule } from "@angular/forms";
import { CommonModule } from "@angular/common";

@Component({
  selector: "backtests-grid-item",
  imports: [ReactiveFormsModule, FormsModule, CommonModule],
  standalone: true,
  templateUrl: "./backtests-grid-item.component.html",
  styleUrl: "./backtests-grid-item.component.scss",
})
export class BacktestsGridItemComponent implements OnInit {
  public backtestsGridItemForm: FormGroup;

  constructor(private fb: FormBuilder, private backtesterService: BacktesterService) {
    this.backtestsGridItemForm = this.fb.group({
      backtestID: [""],
      name: [""],
      description: [""],
      start: [""],
      end: [""],
      synced: [""],
      status: [""],
    });
  }

  ngOnInit(): void {
    this.backtestsGridItemForm.patchValue(this.backtesterService.getSelectedBacktest());
  }
}

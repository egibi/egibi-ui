import { Component, OnInit } from "@angular/core";
import { BacktesterService } from "../backtester.service";
import { ActivatedRoute } from "@angular/router";
import { NgbNavModule } from "@ng-bootstrap/ng-bootstrap";

@Component({
  selector: "backtest",
  imports: [NgbNavModule],
  templateUrl: "./backtest.component.html",
  styleUrl: "./backtest.component.scss",
})
export class BacktestComponent implements OnInit {

  public backtestID: any;
  public active = 1;

  constructor(private route: ActivatedRoute, private backtesterService: BacktesterService) {}

  ngOnInit(): void {
    this.backtestID = this.route.snapshot.paramMap.get('id');  
  }

  

}

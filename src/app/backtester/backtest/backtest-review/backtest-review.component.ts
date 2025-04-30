import { Component } from "@angular/core";
import Highcharts from "highcharts";
import { HighchartsChartModule } from "highcharts-angular";

@Component({
  selector: "backtest-review",
  standalone: true,
  imports: [HighchartsChartModule],
  templateUrl: "./backtest-review.component.html",
  styleUrl: "./backtest-review.component.scss",
})
export class BacktestReviewComponent {

  Highcharts: typeof Highcharts = Highcharts;
  updateFlag = false;

  data = [1, 2, 3, 4];

  chartOptions: Highcharts.Options = {
    series: [
      {
        type: 'line',
        data: this.data,
      },
    ],
  };

}

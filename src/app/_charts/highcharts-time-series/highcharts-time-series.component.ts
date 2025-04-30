import { Component } from "@angular/core";
import { HighchartsChartModule } from 'highcharts-angular';
import * as Highcharts from 'highcharts';

@Component({
  selector: "highcharts-time-series",
  standalone: true,
  imports: [HighchartsChartModule],
  templateUrl: "./highcharts-time-series.component.html",
  styleUrl: "./highcharts-time-series.component.scss",
})
export class HighchartsTimeSeriesComponent {
  Highcharts: typeof Highcharts = Highcharts;

  chartOptions: Highcharts.Options = {
    title: { text: 'Sample Time Series' },
    xAxis: {
      type: 'datetime',
      title: { text: 'Date' }
    },
    yAxis: {
      title: { text: 'Value' }
    },
    series: [{
      name: 'Data',
      type: 'line',
      data: [
        [Date.UTC(2024, 0, 1), 29.9],
        [Date.UTC(2024, 0, 2), 71.5],
        [Date.UTC(2024, 0, 3), 106.4],
        [Date.UTC(2024, 0, 6), 129.2]
      ]
    }]
  };  

}

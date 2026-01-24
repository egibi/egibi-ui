import { Component, Input, OnInit, OnChanges, SimpleChanges, inject } from "@angular/core";
import { HighchartsChartModule } from 'highcharts-angular';
import * as Highcharts from 'highcharts';
import { HighchartsThemeService } from '../../_services/highcharts-theme.service';

export interface TimeSeriesData {
  name: string;
  data: [number, number][];
  type?: 'line' | 'spline' | 'area' | 'areaspline' | 'column';
  color?: string;
}

@Component({
  selector: "highcharts-time-series",
  standalone: true,
  imports: [HighchartsChartModule],
  templateUrl: "./highcharts-time-series.component.html",
  styleUrl: "./highcharts-time-series.component.scss",
})
export class HighchartsTimeSeriesComponent implements OnInit, OnChanges {
  @Input() title?: string;
  @Input() subtitle?: string;
  @Input() series: TimeSeriesData[] = [];
  @Input() height: string = '300px';
  @Input() yAxisTitle?: string;
  @Input() showLegend: boolean = true;
  @Input() chartType: 'line' | 'spline' | 'area' | 'areaspline' = 'areaspline';
  
  private highchartsTheme = inject(HighchartsThemeService);
  
  Highcharts: typeof Highcharts = Highcharts;
  chartOptions: Highcharts.Options = {};
  updateFlag = false;

  ngOnInit(): void {
    this.buildChart();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['series'] || changes['title'] || changes['chartType']) {
      this.buildChart();
      this.updateFlag = true;
    }
  }

  private buildChart(): void {
    const colors = this.highchartsTheme.getColors();
    
    this.chartOptions = {
      chart: {
        type: this.chartType,
        height: this.height,
        zooming: {
          type: 'x'
        }
      },
      title: {
        text: this.title,
        align: 'left'
      },
      subtitle: {
        text: this.subtitle,
        align: 'left'
      },
      xAxis: {
        type: 'datetime',
        title: {
          text: undefined
        },
        crosshair: true
      },
      yAxis: {
        title: {
          text: this.yAxisTitle
        },
        crosshair: true
      },
      legend: {
        enabled: this.showLegend,
        align: 'left',
        verticalAlign: 'top',
        layout: 'horizontal',
        floating: false
      },
      tooltip: {
        shared: true,
        split: false,
        xDateFormat: '%b %d, %Y'
      },
      series: this.series.map((s, i) => ({
        name: s.name,
        type: s.type || this.chartType,
        data: s.data,
        color: s.color || colors[i % colors.length]
      })) as Highcharts.SeriesOptionsType[]
    };
  }
}

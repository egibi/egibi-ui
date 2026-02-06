import { Component, OnInit, Input, OnChanges, SimpleChanges, AfterViewInit, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BacktestResult } from '../../_models/strategy.model';
import { HighchartsThemeService } from '../../_services/highcharts-theme.service';
import * as Highcharts from 'highcharts';

@Component({
  selector: 'backtest-results',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './backtest-results.component.html',
  styleUrl: './backtest-results.component.scss'
})
export class BacktestResultsComponent implements OnChanges, AfterViewInit {
  @Input() result!: BacktestResult;
  @ViewChild('equityChart') equityChartEl!: ElementRef;
  @ViewChild('drawdownChart') drawdownChartEl!: ElementRef;

  chartReady = false;
  activeView: 'summary' | 'trades' = 'summary';

  constructor(private highchartsTheme: HighchartsThemeService) {}

  ngAfterViewInit() {
    this.chartReady = true;
    if (this.result) {
      this.renderCharts();
    }
  }

  ngOnChanges(changes: SimpleChanges) {
    if (changes['result'] && this.chartReady) {
      setTimeout(() => this.renderCharts(), 50);
    }
  }

  // ── Computed Getters ───────────────────────────────────
  get isProfit(): boolean {
    return this.result.totalReturnPct > 0;
  }

  get returnClass(): string {
    if (this.result.totalReturnPct > 0) return 'stat-positive';
    if (this.result.totalReturnPct < 0) return 'stat-negative';
    return '';
  }

  formatDuration(duration: string): string {
    if (!duration) return '—';
    // .NET TimeSpan comes as "d.hh:mm:ss" or "hh:mm:ss"
    const parts = duration.split(/[.:]/);
    if (parts.length >= 3) {
      const hours = parseInt(parts[parts.length - 3]) || 0;
      const minutes = parseInt(parts[parts.length - 2]) || 0;
      if (parts.length >= 4) {
        const days = parseInt(parts[0]) || 0;
        return `${days}d ${hours}h ${minutes}m`;
      }
      return `${hours}h ${minutes}m`;
    }
    return duration;
  }


  // ── Charts ─────────────────────────────────────────────
  private renderCharts() {
    if (!this.result?.equityCurve?.length) return;

    const equityData = this.result.equityCurve.map(p => [
      new Date(p.timestamp).getTime(),
      p.equity
    ]);

    const drawdownData = this.result.equityCurve.map(p => [
      new Date(p.timestamp).getTime(),
      -p.drawdownPct
    ]);

    // Equity Curve
    if (this.equityChartEl) {
      Highcharts.chart(this.equityChartEl.nativeElement, {
        ...this.highchartsTheme.getBaseOptions(),
        chart: { type: 'area', height: 300, backgroundColor: 'transparent' },
        title: { text: undefined },
        xAxis: { type: 'datetime' },
        yAxis: {
          title: { text: 'Equity ($)' },
          labels: { format: '${value:,.0f}' }
        },
        tooltip: {
          headerFormat: '<b>{point.x:%Y-%m-%d %H:%M}</b><br>',
          pointFormat: 'Equity: <b>${point.y:,.2f}</b>'
        },
        legend: { enabled: false },
        series: [{
          type: 'area',
          name: 'Equity',
          data: equityData,
          color: this.isProfit ? '#22c55e' : '#ef4444',
          fillColor: {
            linearGradient: { x1: 0, y1: 0, x2: 0, y2: 1 },
            stops: [
              [0, this.isProfit ? 'rgba(34, 197, 94, 0.25)' : 'rgba(239, 68, 68, 0.25)'],
              [1, 'rgba(0, 0, 0, 0)']
            ]
          } as any,
          lineWidth: 2
        }],
        credits: { enabled: false }
      } as any);
    }

    // Drawdown Chart
    if (this.drawdownChartEl) {
      Highcharts.chart(this.drawdownChartEl.nativeElement, {
        ...this.highchartsTheme.getBaseOptions(),
        chart: { type: 'area', height: 150, backgroundColor: 'transparent' },
        title: { text: undefined },
        xAxis: { type: 'datetime', labels: { enabled: false } },
        yAxis: {
          title: { text: 'Drawdown' },
          labels: { format: '{value}%' },
          max: 0
        },
        tooltip: {
          headerFormat: '<b>{point.x:%Y-%m-%d %H:%M}</b><br>',
          pointFormat: 'Drawdown: <b>{point.y:.2f}%</b>'
        },
        legend: { enabled: false },
        series: [{
          type: 'area',
          name: 'Drawdown',
          data: drawdownData,
          color: '#ef4444',
          fillColor: 'rgba(239, 68, 68, 0.15)',
          lineWidth: 1
        }],
        credits: { enabled: false }
      } as any);
    }
  }
}
import { Component, OnInit, inject } from "@angular/core";
import { CommonModule } from "@angular/common";
import { RouterModule } from "@angular/router";
import { HighchartsTimeSeriesComponent, TimeSeriesData } from "../_charts/highcharts-time-series/highcharts-time-series.component";
import { SetupWizardComponent } from "../setup-wizard/setup-wizard.component";
import { SetupWizardService } from "../setup-wizard/setup-wizard.service";

@Component({
  selector: "home",
  standalone: true,
  imports: [CommonModule, RouterModule, HighchartsTimeSeriesComponent, SetupWizardComponent],
  templateUrl: "./home.component.html",
  styleUrl: "./home.component.scss",
})
export class HomeComponent implements OnInit {
  private wizardService = inject(SetupWizardService);
  showWizard = false;
  // Sample portfolio performance data
  portfolioSeries: TimeSeriesData[] = [
    {
      name: 'Portfolio Value',
      type: 'areaspline',
      data: this.generatePortfolioData()
    }
  ];

  // Sample multi-series data for comparison
  comparisonSeries: TimeSeriesData[] = [
    {
      name: 'BTC',
      type: 'spline',
      data: this.generateAssetData(100000, 0.15)
    },
    {
      name: 'ETH',
      type: 'spline',
      data: this.generateAssetData(50000, 0.20)
    },
    {
      name: 'SOL',
      type: 'spline',
      data: this.generateAssetData(25000, 0.25)
    }
  ];

  constructor() {}

  ngOnInit(): void {
    // Check if the setup wizard should be shown
    if (this.wizardService.shouldShow()) {
      setTimeout(() => {
        this.showWizard = true;
        this.wizardService.show();
      }, 500);
    }
  }

  onWizardClosed(): void {
    this.showWizard = false;
  }

  /** Manually trigger the wizard (e.g., from a button) */
  launchSetupWizard(): void {
    this.wizardService.reset();
    this.showWizard = true;
    this.wizardService.show();
  }

  private generatePortfolioData(): [number, number][] {
    const data: [number, number][] = [];
    const startDate = new Date(2024, 0, 1);
    let value = 100000;
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      // Simulate some realistic growth with volatility
      const dailyChange = (Math.random() - 0.48) * 0.02; // Slight upward bias
      value = value * (1 + dailyChange);
      
      data.push([date.getTime(), Math.round(value * 100) / 100]);
    }
    
    return data;
  }

  private generateAssetData(startValue: number, volatility: number): [number, number][] {
    const data: [number, number][] = [];
    const startDate = new Date(2024, 0, 1);
    let value = startValue;
    
    for (let i = 0; i < 365; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      
      const dailyChange = (Math.random() - 0.47) * volatility;
      value = value * (1 + dailyChange);
      
      data.push([date.getTime(), Math.round(value * 100) / 100]);
    }
    
    return data;
  }
}

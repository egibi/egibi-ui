import { Injectable, inject, effect } from '@angular/core';
import * as Highcharts from 'highcharts';
import { ThemeService } from './theme.service';

@Injectable({
  providedIn: 'root'
})
export class HighchartsThemeService {
  private themeService = inject(ThemeService);
  
  // Color palette matching egibi design system
  private readonly colors = {
    light: {
      // Chart colors (series)
      seriesColors: [
        '#3b82f6', // Primary blue
        '#10b981', // Success green
        '#f59e0b', // Warning amber
        '#ef4444', // Danger red
        '#8b5cf6', // Purple
        '#06b6d4', // Cyan
        '#ec4899', // Pink
        '#f97316', // Orange
      ],
      // Background & surfaces
      background: '#ffffff',
      plotBackground: '#ffffff',
      // Text colors
      textColor: '#1e293b',
      textMuted: '#64748b',
      // Grid & borders
      gridLine: '#e2e8f0',
      tickColor: '#cbd5e1',
      // Tooltip
      tooltipBackground: '#ffffff',
      tooltipBorder: '#e2e8f0',
    },
    dark: {
      // Chart colors (series) - brighter for dark mode
      seriesColors: [
        '#1fb8a2', // Primary teal
        '#10b981', // Success emerald
        '#f59e0b', // Warning amber
        '#ef4444', // Danger red
        '#a78bfa', // Purple
        '#22d3ee', // Cyan
        '#f472b6', // Pink
        '#fb923c', // Orange
      ],
      // Background & surfaces
      background: 'transparent',
      plotBackground: 'transparent',
      // Text colors
      textColor: '#fafafa',
      textMuted: '#8f96a3',
      // Grid & borders
      gridLine: '#272b38',
      tickColor: '#3f4451',
      // Tooltip
      tooltipBackground: '#11131a',
      tooltipBorder: '#272b38',
    }
  };

  constructor() {
    // Apply theme on initialization
    this.applyTheme(this.themeService.isDarkMode());
    
    // React to theme changes
    effect(() => {
      this.applyTheme(this.themeService.isDarkMode());
    });
  }

  /**
   * Apply the Highcharts theme globally
   */
  applyTheme(isDark: boolean): void {
    const palette = isDark ? this.colors.dark : this.colors.light;
    
    const theme: Highcharts.Options = {
      colors: palette.seriesColors,
      
      accessibility: {
        enabled: false
      },

      chart: {
        backgroundColor: palette.background,
        plotBackgroundColor: palette.plotBackground,
        style: {
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
        },
        plotBorderWidth: 0,
        animation: {
          duration: 300
        }
      },
      
      title: {
        style: {
          color: palette.textColor,
          fontSize: '16px',
          fontWeight: '600'
        }
      },
      
      subtitle: {
        style: {
          color: palette.textMuted,
          fontSize: '13px'
        }
      },
      
      xAxis: {
        gridLineColor: palette.gridLine,
        gridLineWidth: 0,
        lineColor: palette.gridLine,
        tickColor: palette.tickColor,
        labels: {
          style: {
            color: palette.textMuted,
            fontSize: '11px'
          }
        },
        title: {
          style: {
            color: palette.textMuted,
            fontSize: '12px',
            fontWeight: '500'
          }
        }
      },
      
      yAxis: {
        gridLineColor: palette.gridLine,
        gridLineWidth: 1,
        gridLineDashStyle: 'Dot',
        lineColor: palette.gridLine,
        tickColor: palette.tickColor,
        labels: {
          style: {
            color: palette.textMuted,
            fontSize: '11px'
          }
        },
        title: {
          style: {
            color: palette.textMuted,
            fontSize: '12px',
            fontWeight: '500'
          }
        }
      },
      
      legend: {
        backgroundColor: 'transparent',
        itemStyle: {
          color: palette.textColor,
          fontSize: '12px',
          fontWeight: '500'
        },
        itemHoverStyle: {
          color: isDark ? '#1fb8a2' : '#3b82f6'
        },
        itemHiddenStyle: {
          color: palette.textMuted
        }
      },
      
      tooltip: {
        backgroundColor: palette.tooltipBackground,
        borderColor: palette.tooltipBorder,
        borderRadius: 8,
        shadow: {
          color: 'rgba(0, 0, 0, 0.15)',
          offsetX: 0,
          offsetY: 4,
          opacity: 0.15,
          width: 12
        },
        style: {
          color: palette.textColor,
          fontSize: '12px'
        },
        headerFormat: '<span style="font-size: 11px; color: ' + palette.textMuted + '">{point.key}</span><br/>',
        pointFormat: '<span style="color:{point.color}">●</span> {series.name}: <b>{point.y}</b><br/>'
      },
      
      plotOptions: {
        series: {
          animation: {
            duration: 500
          },
          borderWidth: 0,
          dataLabels: {
            color: palette.textColor,
            style: {
              fontSize: '11px',
              fontWeight: '500',
              textOutline: 'none'
            }
          },
          marker: {
            lineColor: palette.background === 'transparent' ? '#11131a' : palette.background
          }
        },
        line: {
          lineWidth: 2,
          marker: {
            enabled: false,
            symbol: 'circle',
            radius: 3,
            states: {
              hover: {
                enabled: true,
                radius: 5
              }
            }
          }
        },
        spline: {
          lineWidth: 2,
          marker: {
            enabled: false
          }
        },
        area: {
          fillOpacity: isDark ? 0.15 : 0.1,
          lineWidth: 2,
          marker: {
            enabled: false
          }
        },
        areaspline: {
          fillOpacity: isDark ? 0.15 : 0.1,
          lineWidth: 2,
          marker: {
            enabled: false
          }
        },
        column: {
          borderRadius: 4,
          borderWidth: 0
        },
        bar: {
          borderRadius: 4,
          borderWidth: 0
        },
        pie: {
          borderWidth: 0,
          dataLabels: {
            connectorColor: palette.textMuted
          }
        }
      },
      
      credits: {
        enabled: false
      },
      
      // Navigation buttons (export menu)
      navigation: {
        buttonOptions: {
          symbolStroke: palette.textMuted,
          theme: {
            fill: 'transparent'
          } as any
        }
      },
      
      // Scrollbar (for stock charts - requires Highstock)
      scrollbar: {
        barBackgroundColor: isDark ? '#3f4451' : '#cbd5e1',
        barBorderColor: 'transparent',
        trackBackgroundColor: isDark ? '#1a1d24' : '#f1f5f9',
        trackBorderColor: 'transparent'
      } as any,
      
      // Range selector (for stock charts - requires Highstock)
      rangeSelector: {
        buttonTheme: {
          fill: isDark ? '#272b38' : '#f1f5f9',
          stroke: 'transparent',
          style: {
            color: palette.textMuted
          }
        },
        inputStyle: {
          color: palette.textColor,
          backgroundColor: isDark ? '#272b38' : '#f1f5f9'
        },
        labelStyle: {
          color: palette.textMuted
        }
      } as any,
      
      // Navigator (for stock charts - requires Highstock)
      navigator: {
        handles: {
          backgroundColor: isDark ? '#3f4451' : '#cbd5e1',
          borderColor: palette.textMuted
        },
        outlineColor: palette.gridLine,
        maskFill: isDark ? 'rgba(31, 184, 162, 0.1)' : 'rgba(59, 130, 246, 0.1)',
        series: {
          color: isDark ? '#1fb8a2' : '#3b82f6',
          lineColor: isDark ? '#1fb8a2' : '#3b82f6'
        },
        xAxis: {
          gridLineColor: palette.gridLine,
          labels: {
            style: {
              color: palette.textMuted
            }
          }
        }
      } as any
    };

    // Apply theme globally
    Highcharts.setOptions(theme);
  }

  /**
   * Get base chart options with theme applied
   */
  getBaseOptions(): Highcharts.Options {
    const isDark = this.themeService.isDarkMode();
    const palette = isDark ? this.colors.dark : this.colors.light;
    
    return {
      chart: {
        backgroundColor: palette.background
      },
      credits: {
        enabled: false
      }
    };
  }

  /**
   * Get current color palette
   */
  getColors(): string[] {
    const isDark = this.themeService.isDarkMode();
    return isDark ? this.colors.dark.seriesColors : this.colors.light.seriesColors;
  }

  /**
   * Get primary chart color
   */
  getPrimaryColor(): string {
    const isDark = this.themeService.isDarkMode();
    return isDark ? '#1fb8a2' : '#3b82f6';
  }

  /**
   * Get success color for positive values
   */
  getSuccessColor(): string {
    return '#10b981';
  }

  /**
   * Get danger color for negative values
   */
  getDangerColor(): string {
    return '#ef4444';
  }
}

import { Injectable, inject, computed, Signal } from '@angular/core';
import {
  themeQuartz,
  colorSchemeDark,
  colorSchemeLight,
  Theme,
} from 'ag-grid-community';
import { ThemeService } from './theme.service';

@Injectable({
  providedIn: 'root'
})
export class AgGridThemeService {
  private themeService = inject(ThemeService);

  // Custom theme parameters for light mode
  private readonly lightParams = {
    // Background colors
    backgroundColor: '#ffffff',
    foregroundColor: '#1e293b',
    headerBackgroundColor: '#f8fafc',
    headerForegroundColor: '#475569',
    
    // Borders
    borderColor: '#e2e8f0',
    borderRadius: 8,
    wrapperBorderRadius: 8,
    
    // Row colors
    oddRowBackgroundColor: '#ffffff',
    rowHoverColor: '#f1f5f9',
    selectedRowBackgroundColor: '#eff6ff',
    
    // Cell styling
    cellHorizontalPadding: 16,
    headerCellHoverBackgroundColor: '#f1f5f9',
    
    // Font
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontSize: 13,
    headerFontSize: 12,
    headerFontWeight: 600,
    
    // Accent/primary color
    accentColor: '#3b82f6',
    rangeSelectionBorderColor: '#3b82f6',
    
    // Checkbox
    checkboxCheckedBackgroundColor: '#3b82f6',
    checkboxCheckedBorderColor: '#3b82f6',
    checkboxUncheckedBackgroundColor: '#ffffff',
    checkboxUncheckedBorderColor: '#cbd5e1',
    
    // Input
    inputBackgroundColor: '#ffffff',
    inputBorderColor: '#e2e8f0',
    inputFocusBorderColor: '#3b82f6',
    
    // Spacing
    gridSize: 6,
    rowHeight: 44,
    headerHeight: 44,
  };

  // Custom theme parameters for dark mode
  private readonly darkParams = {
    // Background colors - matching egibi dark theme
    backgroundColor: 'transparent',
    foregroundColor: '#fafafa',
    headerBackgroundColor: '#0d0f14',
    headerForegroundColor: '#8f96a3',
    
    // Borders
    borderColor: '#1e2028',
    borderRadius: 8,
    wrapperBorderRadius: 8,
    
    // Row colors
    oddRowBackgroundColor: 'transparent',
    rowHoverColor: '#15171e',
    selectedRowBackgroundColor: 'rgba(31, 184, 162, 0.1)',
    
    // Cell styling
    cellHorizontalPadding: 16,
    headerCellHoverBackgroundColor: '#1a1d24',
    
    // Font
    fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
    fontSize: 13,
    headerFontSize: 12,
    headerFontWeight: 600,
    
    // Accent/primary color - teal for dark mode
    accentColor: '#1fb8a2',
    rangeSelectionBorderColor: '#1fb8a2',
    
    // Checkbox
    checkboxCheckedBackgroundColor: '#1fb8a2',
    checkboxCheckedBorderColor: '#1fb8a2',
    checkboxUncheckedBackgroundColor: 'transparent',
    checkboxUncheckedBorderColor: '#3f4451',
    
    // Input
    inputBackgroundColor: '#11131a',
    inputBorderColor: '#272b38',
    inputFocusBorderColor: '#1fb8a2',
    
    // Spacing
    gridSize: 6,
    rowHeight: 44,
    headerHeight: 44,
  };

  // Light theme
  private readonly lightTheme: Theme = themeQuartz
    .withPart(colorSchemeLight)
    .withParams(this.lightParams);

  // Dark theme
  private readonly darkTheme: Theme = themeQuartz
    .withPart(colorSchemeDark)
    .withParams(this.darkParams);

  /**
   * Computed signal that returns the appropriate theme based on current mode
   */
  public theme: Signal<Theme> = computed(() => {
    return this.themeService.isDarkMode() ? this.darkTheme : this.lightTheme;
  });

  /**
   * Get the current theme (non-reactive)
   */
  public getTheme(): Theme {
    return this.themeService.isDarkMode() ? this.darkTheme : this.lightTheme;
  }

  /**
   * Get light theme
   */
  public getLightTheme(): Theme {
    return this.lightTheme;
  }

  /**
   * Get dark theme
   */
  public getDarkTheme(): Theme {
    return this.darkTheme;
  }

  /**
   * Check if currently in dark mode
   */
  public isDarkMode(): boolean {
    return this.themeService.isDarkMode();
  }
}

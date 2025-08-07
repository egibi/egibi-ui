import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TableColumn, SortConfig } from './egibi-table.models';

@Component({
  selector: 'egibi-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './egibi-table.component.html',
  styleUrls: ['./egibi-table.component.scss']
})
export class EgibiTableComponent implements OnInit {
  @Input() data: any[] = [];
  @Input() columns: TableColumn[] = [];

  sortConfig: SortConfig = { key: '', direction: null };
  sortedData: any[] = [];

  ngOnInit() {
    this.sortedData = [...this.data];
  }

  ngOnChanges() {
    this.applySort();
  }

  onSort(key: string, sortable: boolean = true) {
    if (!sortable) return;

    if (this.sortConfig.key === key) {
      // Toggle direction: asc -> desc -> null -> asc
      if (this.sortConfig.direction === 'asc') {
        this.sortConfig.direction = 'desc';
      } else if (this.sortConfig.direction === 'desc') {
        this.sortConfig.direction = null;
        this.sortConfig.key = '';
      } else {
        this.sortConfig.direction = 'asc';
      }
    } else {
      // New column, start with ascending
      this.sortConfig.key = key;
      this.sortConfig.direction = 'asc';
    }

    this.applySort();
  }

  private applySort() {
    if (!this.sortConfig.key || !this.sortConfig.direction) {
      this.sortedData = [...this.data];
      return;
    }

    this.sortedData = [...this.data].sort((a, b) => {
      const aValue = this.getNestedValue(a, this.sortConfig.key);
      const bValue = this.getNestedValue(b, this.sortConfig.key);

      // Handle null/undefined values
      if (aValue == null && bValue == null) return 0;
      if (aValue == null) return 1;
      if (bValue == null) return -1;

      // Compare values
      let comparison = 0;
      if (typeof aValue === 'string' && typeof bValue === 'string') {
        comparison = aValue.localeCompare(bValue);
      } else if (typeof aValue === 'number' && typeof bValue === 'number') {
        comparison = aValue - bValue;
      } else {
        comparison = String(aValue).localeCompare(String(bValue));
      }

      return this.sortConfig.direction === 'asc' ? comparison : -comparison;
    });
  }

  // Helper method to get nested object values (e.g., "user.name")
  getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  trackByFn(index: number, item: any): any {
    return item.id || index;
  }
}
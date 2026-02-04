import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Connection, SERVICE_CATEGORIES, ALL_CREDENTIAL_FIELDS, CREDENTIAL_FIELD_LABELS } from '../../_models/connection.model';
import { ConnectionsService } from '../../_services/connections.service';

@Component({
  selector: 'service-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './service-catalog.component.html',
  styleUrl: './service-catalog.component.scss',
})
export class ServiceCatalogComponent implements OnInit {
  connections: Connection[] = [];
  categories = SERVICE_CATEGORIES;
  allCredentialFields = ALL_CREDENTIAL_FIELDS;
  fieldLabels = CREDENTIAL_FIELD_LABELS;
  loading = true;

  // Edit state
  editing: Connection | null = null;
  isNew = false;

  // Form fields
  formName = '';
  formDescription = '';
  formCategory = 'crypto_exchange';
  formIconKey = '';
  formColor = '#6C757D';
  formWebsite = '';
  formDefaultBaseUrl = '';
  formRequiredFields: string[] = ['api_key', 'api_secret'];
  formIsDataSource = true;
  formSortOrder = 0;

  constructor(private connectionsService: ConnectionsService) {}

  ngOnInit(): void {
    this.loadConnections();
  }

  loadConnections(): void {
    this.loading = true;
    this.connectionsService.getConnections().subscribe({
      next: (res: any) => {
        this.connections = (res.responseData || []).sort(
          (a: Connection, b: Connection) => (a.sortOrder || 0) - (b.sortOrder || 0)
        );
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      },
    });
  }

  getCategoryLabel(value: string): string {
    return this.categories.find((c) => c.value === value)?.label || value || 'Uncategorized';
  }

  getGroupedConnections(): { category: string; label: string; items: Connection[] }[] {
    const groups: Record<string, Connection[]> = {};
    for (const conn of this.connections) {
      const cat = conn.category || 'other';
      if (!groups[cat]) groups[cat] = [];
      groups[cat].push(conn);
    }
    return this.categories
      .filter((c) => groups[c.value]?.length)
      .map((c) => ({ category: c.value, label: c.label, items: groups[c.value] }));
  }

  // =============================================
  // EDIT / CREATE
  // =============================================

  addNew(): void {
    this.isNew = true;
    this.editing = new Connection();
    this.formName = '';
    this.formDescription = '';
    this.formCategory = 'crypto_exchange';
    this.formIconKey = '';
    this.formColor = '#6C757D';
    this.formWebsite = '';
    this.formDefaultBaseUrl = '';
    this.formRequiredFields = ['api_key', 'api_secret'];
    this.formIsDataSource = true;
    this.formSortOrder = this.connections.length + 1;
  }

  edit(conn: Connection): void {
    this.isNew = false;
    this.editing = conn;
    this.formName = conn.name;
    this.formDescription = conn.description || '';
    this.formCategory = conn.category || 'other';
    this.formIconKey = conn.iconKey || '';
    this.formColor = conn.color || '#6C757D';
    this.formWebsite = conn.website || '';
    this.formDefaultBaseUrl = conn.defaultBaseUrl || '';
    this.formIsDataSource = conn.isDataSource ?? true;
    this.formSortOrder = conn.sortOrder || 0;
    try {
      this.formRequiredFields = JSON.parse(conn.requiredFields || '[]');
    } catch {
      this.formRequiredFields = [];
    }
  }

  cancelEdit(): void {
    this.editing = null;
    this.isNew = false;
  }

  toggleField(field: string): void {
    const idx = this.formRequiredFields.indexOf(field);
    if (idx >= 0) {
      this.formRequiredFields.splice(idx, 1);
    } else {
      this.formRequiredFields.push(field);
    }
  }

  isFieldSelected(field: string): boolean {
    return this.formRequiredFields.includes(field);
  }

  save(): void {
    if (!this.editing || !this.formName.trim()) return;

    const conn: any = {
      ...this.editing,
      name: this.formName.trim(),
      description: this.formDescription.trim(),
      category: this.formCategory,
      iconKey: this.formIconKey.trim(),
      color: this.formColor,
      website: this.formWebsite.trim(),
      defaultBaseUrl: this.formDefaultBaseUrl.trim(),
      requiredFields: JSON.stringify(this.formRequiredFields),
      isDataSource: this.formIsDataSource,
      sortOrder: this.formSortOrder,
      connectionTypeId: 2, // api
      isActive: true,
    };

    if (this.isNew) {
      conn.id = 0;
    }

    this.connectionsService.saveConnection(conn).subscribe({
      next: () => {
        this.editing = null;
        this.isNew = false;
        this.loadConnections();
      },
    });
  }

  delete(conn: Connection): void {
    if (!confirm(`Delete "${conn.name}" from the service catalog?`)) return;
    this.connectionsService.deleteConnection(conn.id).subscribe({
      next: () => this.loadConnections(),
    });
  }
}
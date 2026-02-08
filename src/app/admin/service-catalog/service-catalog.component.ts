import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Connection, SERVICE_CATEGORIES, CREDENTIAL_FIELD_LABELS } from '../../_models/connection.model';
import { ConnectionsService } from '../../_services/connections.service';
import { NgbGlobalModalService, ModalResult } from '../../_services/ngb-global-modal.service';
import { EditServiceModalComponent } from './edit-service-modal/edit-service-modal.component';

@Component({
  selector: 'service-catalog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './service-catalog.component.html',
  styleUrl: './service-catalog.component.scss',
})
export class ServiceCatalogComponent implements OnInit {
  connections: Connection[] = [];
  categories = SERVICE_CATEGORIES;
  fieldLabels = CREDENTIAL_FIELD_LABELS;
  loading = true;

  constructor(
    private connectionsService: ConnectionsService,
    private modalService: NgbGlobalModalService,
  ) {}

  ngOnInit(): void {
    this.loadConnections();
  }

  loadConnections(): void {
    this.loading = true;
    this.connectionsService.getConnections().subscribe({
      next: (res: any) => {
        const raw: any[] = res.responseData || [];
        this.connections = raw
          .filter((c: any) => c.name?.trim())
          .map((c: any) => Object.assign(new Connection(), c))
          .sort((a: Connection, b: Connection) => (a.sortOrder || 0) - (b.sortOrder || 0));
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
  // MODAL OPERATIONS
  // =============================================

  addNew(): void {
    this.modalService
      .openModal(
        EditServiceModalComponent,
        { size: 'lg', centered: true, scrollable: true },
        { connection: null },
      )
      .subscribe((modalResult: ModalResult) => {
        if (modalResult.result && !modalResult.dismissed) {
          this.connectionsService.saveConnection(modalResult.result).subscribe({
            next: () => this.loadConnections(),
          });
        }
      });
  }

  edit(conn: Connection): void {
    this.modalService
      .openModal(
        EditServiceModalComponent,
        { size: 'lg', centered: true, scrollable: true },
        { connection: conn },
      )
      .subscribe((modalResult: ModalResult) => {
        if (modalResult.result && !modalResult.dismissed) {
          this.connectionsService.saveConnection(modalResult.result).subscribe({
            next: () => this.loadConnections(),
          });
        }
      });
  }

  delete(conn: Connection): void {
    if (!confirm(`Delete "${conn.name}" from the service catalog?`)) return;
    this.connectionsService.deleteConnection(conn.id).subscribe({
      next: () => this.loadConnections(),
    });
  }
}

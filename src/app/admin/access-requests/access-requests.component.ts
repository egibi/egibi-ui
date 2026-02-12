import { Component, OnInit, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NgbModalModule, NgbModal } from '@ng-bootstrap/ng-bootstrap';
import { AccessRequestsService, AccessRequestSummary } from './access-requests.service';
import { ToastService } from '../../_services/toast.service';

@Component({
  selector: 'access-requests',
  standalone: true,
  imports: [CommonModule, FormsModule, NgbModalModule],
  templateUrl: './access-requests.component.html',
  styleUrl: './access-requests.component.scss'
})
export class AccessRequestsComponent implements OnInit {
  private service = inject(AccessRequestsService);
  private toast = inject(ToastService);
  private modalService = inject(NgbModal);

  requests = signal<AccessRequestSummary[]>([]);
  loading = signal(false);
  showAll = signal(false);
  processingId = signal<number | null>(null);

  // Deny modal state
  denyTargetId = signal<number | null>(null);
  denyReason = '';

  get pendingCount(): number {
    return this.requests().filter(r => r.status === 'pending').length;
  }

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading.set(true);

    const obs = this.showAll()
      ? this.service.getAllRequests()
      : this.service.getPendingRequests();

    obs.subscribe({
      next: (res) => {
        this.requests.set(res.responseData ?? []);
        this.loading.set(false);
      },
      error: () => {
        this.toast.showToast('Failed to load access requests', 'error');
        this.loading.set(false);
      }
    });
  }

  toggleShowAll(): void {
    this.showAll.update(v => !v);
    this.loadRequests();
  }

  approve(id: number): void {
    this.processingId.set(id);

    this.service.approveRequest(id).subscribe({
      next: (res) => {
        this.toast.showToast(res.responseMessage || 'Request approved', 'success');
        this.processingId.set(null);
        this.loadRequests();
      },
      error: () => {
        this.toast.showToast('Failed to approve request', 'error');
        this.processingId.set(null);
      }
    });
  }

  openDenyModal(id: number, modal: any): void {
    this.denyTargetId.set(id);
    this.denyReason = '';
    this.modalService.open(modal, { centered: true });
  }

  confirmDeny(modal: any): void {
    const id = this.denyTargetId();
    if (!id) return;

    this.processingId.set(id);
    modal.close();

    this.service.denyRequest(id, this.denyReason || undefined).subscribe({
      next: (res) => {
        this.toast.showToast(res.responseMessage || 'Request denied', 'success');
        this.processingId.set(null);
        this.denyTargetId.set(null);
        this.loadRequests();
      },
      error: () => {
        this.toast.showToast('Failed to deny request', 'error');
        this.processingId.set(null);
      }
    });
  }

  formatDate(iso: string): string {
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }
}

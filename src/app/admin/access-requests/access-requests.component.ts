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
  processingId = signal<number | null>(null);

  // Status filter
  statusFilter = signal<string | null>(null);
  statusOptions = [
    { label: 'All', value: null as string | null },
    { label: 'Pending Verification', value: 'pending_verification' },
    { label: 'Pending', value: 'pending' },
    { label: 'Approved', value: 'approved' },
    { label: 'Denied', value: 'denied' }
  ];

  // Deny modal state
  denyTargetId = signal<number | null>(null);
  denyReason = '';

  // Review modal state
  reviewRequest = signal<AccessRequestSummary | null>(null);

  // Delete modal state
  deleteTargetId = signal<number | null>(null);

  get pendingCount(): number {
    return this.requests().filter(r => r.status === 'pending' || r.status === 'pending_verification').length;
  }

  get filteredRequests(): AccessRequestSummary[] {
    const filter = this.statusFilter();
    if (filter === null) {
      return this.requests();
    }
    return this.requests().filter(r => r.status === filter);
  }

  getCountForStatus(status: string | null): number {
    if (status === null) {
      return this.requests().length;
    }
    return this.requests().filter(r => r.status === status).length;
  }

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading.set(true);

    this.service.getAllRequests().subscribe({
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

  // Review modal
  openReviewModal(req: AccessRequestSummary, modal: any): void {
    this.reviewRequest.set(req);
    this.modalService.open(modal, { centered: true, size: 'lg' });
  }

  approveFromReview(modal: any): void {
    const req = this.reviewRequest();
    if (!req) return;
    modal.close();
    this.approve(req.id);
  }

  rejectFromReview(denyModal: any, reviewModal: any): void {
    const req = this.reviewRequest();
    if (!req) return;
    reviewModal.close();
    this.openDenyModal(req.id, denyModal);
  }

  // Deny modal
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

  // Delete modal
  openDeleteModal(id: number, modal: any): void {
    this.deleteTargetId.set(id);
    this.modalService.open(modal, { centered: true });
  }

  confirmDelete(modal: any): void {
    const id = this.deleteTargetId();
    if (!id) return;

    this.processingId.set(id);
    modal.close();

    this.service.deleteRequest(id).subscribe({
      next: (res) => {
        this.toast.showToast(res.responseMessage || 'Request deleted', 'success');
        this.processingId.set(null);
        this.deleteTargetId.set(null);
        this.loadRequests();
      },
      error: () => {
        this.toast.showToast('Failed to delete request', 'error');
        this.processingId.set(null);
      }
    });
  }

  // Helpers
  isPending(status: string): boolean {
    return status === 'pending' || status === 'pending_verification';
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending_verification': return 'bg-info text-dark';
      case 'pending': return 'bg-warning text-dark';
      case 'approved': return 'bg-success';
      case 'denied': return 'bg-danger';
      default: return 'bg-secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'pending_verification': return 'Pending Verification';
      case 'pending': return 'Pending';
      case 'approved': return 'Approved';
      case 'denied': return 'Denied';
      default: return status;
    }
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

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

  // Status filter (null = all)
  statusFilter = signal<string | null>(null);

  statusOptions: { value: string | null; label: string }[] = [
    { value: null, label: 'All' },
    { value: 'pending_verification', label: 'Pending Verification' },
    { value: 'pending', label: 'Pending' },
    { value: 'approved', label: 'Approved' },
    { value: 'denied', label: 'Denied' }
  ];

  // Review modal state
  reviewRequest = signal<AccessRequestSummary | null>(null);

  // Deny modal state
  denyTargetId = signal<number | null>(null);
  denyReason = '';

  // Delete modal state
  deleteTargetId = signal<number | null>(null);

  get pendingCount(): number {
    return this.requests().filter(r => r.status === 'pending').length;
  }

  get filteredRequests(): AccessRequestSummary[] {
    const filter = this.statusFilter();
    if (!filter) return this.requests();
    return this.requests().filter(r => r.status === filter);
  }

  ngOnInit(): void {
    this.loadRequests();
  }

  // =============================================
  // DATA LOADING
  // =============================================

  loadRequests(): void {
    this.loading.set(true);

    // Always load all requests; filter client-side
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

  setStatusFilter(status: string | null): void {
    this.statusFilter.set(status);
  }

  // =============================================
  // APPROVE
  // =============================================

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

  // =============================================
  // DENY / REJECT
  // =============================================

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

  // =============================================
  // REVIEW MODAL
  // =============================================

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

  rejectFromReview(modal: any, denyModal: any): void {
    const req = this.reviewRequest();
    if (!req) return;
    modal.close();
    this.openDenyModal(req.id, denyModal);
  }

  // =============================================
  // DELETE
  // =============================================

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

  // =============================================
  // HELPERS
  // =============================================

  getCountForStatus(status: string | null): number {
    if (!status) return this.requests().length;
    return this.requests().filter(r => r.status === status).length;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'pending':
        return 'bg-warning text-dark';
      case 'pending_verification':
        return 'bg-info text-dark';
      case 'approved':
        return 'bg-success';
      case 'denied':
        return 'bg-danger';
      default:
        return 'bg-secondary';
    }
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'pending_verification':
        return 'Pending Verification';
      case 'pending':
        return 'Pending';
      case 'approved':
        return 'Approved';
      case 'denied':
        return 'Denied';
      default:
        return status;
    }
  }

  isPending(status: string): boolean {
    return status === 'pending' || status === 'pending_verification';
  }

  formatDate(iso: string | null): string {
    if (!iso) return '--';
    return new Date(iso).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }
}

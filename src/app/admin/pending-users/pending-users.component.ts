import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PendingUsersService, AccessRequestDto } from './pending-users.service';

@Component({
  selector: 'app-pending-users',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './pending-users.component.html',
  styleUrls: ['./pending-users.component.scss']
})
export class PendingUsersComponent implements OnInit {
  requests = signal<AccessRequestDto[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);
  statusFilter = signal<string>('Pending');

  // Rejection modal state
  showRejectModal = signal(false);
  rejectingRequest = signal<AccessRequestDto | null>(null);
  rejectionReason = '';

  constructor(private pendingUsersService: PendingUsersService) {}

  ngOnInit(): void {
    this.loadRequests();
  }

  loadRequests(): void {
    this.loading.set(true);
    this.error.set(null);

    const status = this.statusFilter() === 'All' ? undefined : this.statusFilter();

    this.pendingUsersService.getAccessRequests(status).subscribe({
      next: (res) => {
        this.requests.set(res.responseData || []);
        this.loading.set(false);
      },
      error: (err) => {
        this.error.set('Failed to load access requests.');
        this.loading.set(false);
      }
    });
  }

  onFilterChange(status: string): void {
    this.statusFilter.set(status);
    this.loadRequests();
  }

  approve(request: AccessRequestDto): void {
    this.error.set(null);
    this.success.set(null);

    this.pendingUsersService.approveRequest(request.id).subscribe({
      next: (res) => {
        this.success.set(`Access approved for ${request.email}.`);
        this.loadRequests();
      },
      error: (err) => {
        this.error.set(err?.error?.statusMessage || 'Failed to approve request.');
      }
    });
  }

  openRejectModal(request: AccessRequestDto): void {
    this.rejectingRequest.set(request);
    this.rejectionReason = '';
    this.showRejectModal.set(true);
  }

  cancelReject(): void {
    this.showRejectModal.set(false);
    this.rejectingRequest.set(null);
    this.rejectionReason = '';
  }

  confirmReject(): void {
    const request = this.rejectingRequest();
    if (!request) return;

    this.error.set(null);
    this.success.set(null);

    this.pendingUsersService.rejectRequest(request.id, this.rejectionReason).subscribe({
      next: (res) => {
        this.success.set(`Access request for ${request.email} has been rejected.`);
        this.showRejectModal.set(false);
        this.rejectingRequest.set(null);
        this.rejectionReason = '';
        this.loadRequests();
      },
      error: (err) => {
        this.error.set(err?.error?.statusMessage || 'Failed to reject request.');
      }
    });
  }

  deleteRequest(request: AccessRequestDto): void {
    if (!confirm(`Delete access request from ${request.email}? This cannot be undone.`)) return;

    this.pendingUsersService.deleteRequest(request.id).subscribe({
      next: () => {
        this.success.set(`Request from ${request.email} deleted.`);
        this.loadRequests();
      },
      error: () => {
        this.error.set('Failed to delete request.');
      }
    });
  }

  get pendingCount(): number {
    return this.requests().filter(r => r.status === 'Pending').length;
  }
}

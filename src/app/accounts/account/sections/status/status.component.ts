import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AccountDetailResponse, TestConnectionResponse } from '../../../../_models/account-detail.model';
import { AccountsService } from '../../../accounts.service';

@Component({
  selector: 'account-status',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './status.component.html',
  styleUrl: './status.component.scss',
})
export class StatusComponent {
  @Input() account: AccountDetailResponse | null = null;

  testing = false;
  testResult: TestConnectionResponse | null = null;
  testError: string | null = null;

  constructor(private accountsService: AccountsService) {}

  get hasConnection(): boolean {
    return !!this.account?.connectionId;
  }

  get hasBaseUrl(): boolean {
    return !!this.account?.baseUrl;
  }

  get statusIcon(): string {
    if (!this.testResult) return 'neutral';
    return this.testResult.success ? 'success' : 'error';
  }

  testConnection(): void {
    if (!this.account) return;

    this.testing = true;
    this.testResult = null;
    this.testError = null;

    this.accountsService.testConnection(this.account.id).subscribe({
      next: (res) => {
        this.testing = false;
        if (res.responseCode === 200) {
          this.testResult = res.responseData;
        } else {
          this.testError = res.responseMessage || 'Test failed';
        }
      },
      error: (err) => {
        this.testing = false;
        this.testError = 'Failed to run connection test';
        console.error('Connection test error:', err);
      },
    });
  }
}
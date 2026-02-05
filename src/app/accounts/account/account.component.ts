import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { NgbNavModule } from '@ng-bootstrap/ng-bootstrap';
import { AccountsService } from '../accounts.service';
import { AccountDetailResponse } from '../../_models/account-detail.model';
import { AccountType } from '../../_models/account-type';
import { GeneralComponent } from './sections/general/general.component';
import { ApiComponent } from './sections/api/api.component';
import { FeesComponent } from './sections/fees/fees.component';
import { StatusComponent } from './sections/status/status.component';

@Component({
  selector: 'account',
  standalone: true,
  imports: [
    CommonModule,
    NgbNavModule,
    GeneralComponent,
    ApiComponent,
    FeesComponent,
    StatusComponent,
  ],
  templateUrl: './account.component.html',
  styleUrl: './account.component.scss',
})
export class AccountComponent implements OnInit {
  accountDetail: AccountDetailResponse | null = null;
  accountTypes: AccountType[] = [];
  activeTab = 'general';
  loading = true;
  error: string | null = null;

  private accountId: number | null = null;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private accountsService: AccountsService
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam) {
      this.accountId = parseInt(idParam, 10);
      this.loadAccountDetail();
      this.loadAccountTypes();
    } else {
      // No ID — redirect back to accounts list
      this.router.navigate(['/accounts']);
    }
  }

  loadAccountDetail(): void {
    if (!this.accountId) return;

    this.loading = true;
    this.error = null;

    this.accountsService.getAccountDetail(this.accountId).subscribe({
      next: (res) => {
        if (res.responseCode === 200) {
          this.accountDetail = res.responseData;
        } else {
          this.error = res.responseMessage || 'Failed to load account';
        }
        this.loading = false;
      },
      error: (err) => {
        this.error = 'Failed to load account details';
        this.loading = false;
        console.error('Account detail load error:', err);
      },
    });
  }

  loadAccountTypes(): void {
    this.accountsService.getAccountTypes().subscribe({
      next: (res) => {
        this.accountTypes = res.responseData || [];
      },
    });
  }

  /** Called by child components after a successful save */
  onAccountUpdated(): void {
    this.loadAccountDetail();
  }

  /** Navigate back to accounts list */
  goBack(): void {
    this.router.navigate(['/accounts']);
  }
}
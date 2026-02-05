import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AccountDetailResponse, UpdateAccountFeesRequest } from '../../../../_models/account-detail.model';
import { AccountsService } from '../../../accounts.service';

@Component({
  selector: 'account-fees',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './fees.component.html',
  styleUrl: './fees.component.scss',
})
export class FeesComponent implements OnChanges {
  @Input() account: AccountDetailResponse | null = null;
  @Output() saved = new EventEmitter<void>();

  feeForm: FormGroup;
  saving = false;
  saveMessage: string | null = null;
  saveError = false;

  feeScheduleTypes = [
    { value: 'flat', label: 'Flat Rate' },
    { value: 'tiered', label: 'Tiered (Volume-based)' },
    { value: 'volume', label: 'Volume Discount' },
  ];

  constructor(private fb: FormBuilder, private accountsService: AccountsService) {
    this.feeForm = this.fb.group({
      makerFeePercent: [0],
      takerFeePercent: [0],
      feeScheduleType: ['flat'],
      notes: [''],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['account'] && this.account?.fees) {
      this.feeForm.patchValue({
        makerFeePercent: this.account.fees.makerFeePercent,
        takerFeePercent: this.account.fees.takerFeePercent,
        feeScheduleType: this.account.fees.feeScheduleType || 'flat',
        notes: this.account.fees.notes || '',
      });
      this.feeForm.markAsPristine();
    }
  }

  get hasChanges(): boolean {
    return this.feeForm.dirty;
  }

  get hasFees(): boolean {
    return !!this.account?.fees?.id;
  }

  onSave(): void {
    if (!this.account) return;

    this.saving = true;
    this.saveMessage = null;

    const request: UpdateAccountFeesRequest = {
      accountId: this.account.id,
      makerFeePercent: this.feeForm.value.makerFeePercent || 0,
      takerFeePercent: this.feeForm.value.takerFeePercent || 0,
      feeScheduleType: this.feeForm.value.feeScheduleType || 'flat',
      notes: this.feeForm.value.notes || '',
    };

    this.accountsService.updateFees(request).subscribe({
      next: (res) => {
        this.saving = false;
        if (res.responseCode === 200) {
          this.saveMessage = 'Fees updated successfully';
          this.saveError = false;
          this.feeForm.markAsPristine();
          this.saved.emit();
        } else {
          this.saveMessage = res.responseMessage || 'Failed to update fees';
          this.saveError = true;
        }
        setTimeout(() => (this.saveMessage = null), 3000);
      },
      error: (err) => {
        this.saving = false;
        this.saveMessage = 'Failed to update fees';
        this.saveError = true;
        console.error('Fee update error:', err);
        setTimeout(() => (this.saveMessage = null), 3000);
      },
    });
  }

  onCancel(): void {
    if (this.account?.fees) {
      this.feeForm.patchValue({
        makerFeePercent: this.account.fees.makerFeePercent,
        takerFeePercent: this.account.fees.takerFeePercent,
        feeScheduleType: this.account.fees.feeScheduleType || 'flat',
        notes: this.account.fees.notes || '',
      });
    } else {
      this.feeForm.reset({ makerFeePercent: 0, takerFeePercent: 0, feeScheduleType: 'flat', notes: '' });
    }
    this.feeForm.markAsPristine();
  }
}
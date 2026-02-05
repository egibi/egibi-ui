import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { AccountDetailResponse, UpdateAccountRequest } from '../../../../_models/account-detail.model';
import { AccountType } from '../../../../_models/account-type';
import { AccountsService } from '../../../accounts.service';

@Component({
  selector: 'account-general',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './general.component.html',
  styleUrl: './general.component.scss',
})
export class GeneralComponent implements OnChanges {
  @Input() account: AccountDetailResponse | null = null;
  @Input() accountTypes: AccountType[] = [];
  @Output() saved = new EventEmitter<void>();

  form: FormGroup;
  saving = false;
  saveMessage: string | null = null;
  saveError = false;

  constructor(private fb: FormBuilder, private accountsService: AccountsService) {
    this.form = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(200)]],
      description: [''],
      notes: [''],
      accountTypeId: [null],
      isActive: [true],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['account'] && this.account) {
      this.form.patchValue({
        name: this.account.name,
        description: this.account.description,
        notes: this.account.notes,
        accountTypeId: this.account.accountTypeId,
        isActive: this.account.isActive,
      });
      this.form.markAsPristine();
    }
  }

  get hasChanges(): boolean {
    return this.form.dirty;
  }

  onSave(): void {
    if (this.form.invalid || !this.account) return;

    this.saving = true;
    this.saveMessage = null;

    const request: UpdateAccountRequest = {
      id: this.account.id,
      name: this.form.value.name,
      description: this.form.value.description || '',
      notes: this.form.value.notes || '',
      accountTypeId: this.form.value.accountTypeId,
      isActive: this.form.value.isActive,
    };

    this.accountsService.updateAccount(request).subscribe({
      next: (res) => {
        this.saving = false;
        if (res.responseCode === 200) {
          this.saveMessage = 'Account updated successfully';
          this.saveError = false;
          this.form.markAsPristine();
          this.saved.emit();
        } else {
          this.saveMessage = res.responseMessage || 'Failed to update';
          this.saveError = true;
        }
        setTimeout(() => (this.saveMessage = null), 3000);
      },
      error: (err) => {
        this.saving = false;
        this.saveMessage = 'Failed to update account';
        this.saveError = true;
        console.error('Update error:', err);
        setTimeout(() => (this.saveMessage = null), 3000);
      },
    });
  }

  onCancel(): void {
    if (this.account) {
      this.form.patchValue({
        name: this.account.name,
        description: this.account.description,
        notes: this.account.notes,
        accountTypeId: this.account.accountTypeId,
        isActive: this.account.isActive,
      });
      this.form.markAsPristine();
    }
  }
}
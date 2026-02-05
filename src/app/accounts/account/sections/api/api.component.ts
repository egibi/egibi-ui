import { Component, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { AccountDetailResponse, UpdateCredentialsRequest } from '../../../../_models/account-detail.model';
import { AccountsService } from '../../../accounts.service';
import { CREDENTIAL_FIELD_LABELS } from '../../../../_models/connection.model';

@Component({
  selector: 'account-api',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './api.component.html',
  styleUrl: './api.component.scss',
})
export class ApiComponent implements OnChanges {
  @Input() account: AccountDetailResponse | null = null;
  @Output() saved = new EventEmitter<void>();

  credentialForm: FormGroup;
  editMode = false;
  saving = false;
  saveMessage: string | null = null;
  saveError = false;

  fieldLabels = CREDENTIAL_FIELD_LABELS;

  constructor(private fb: FormBuilder, private accountsService: AccountsService) {
    this.credentialForm = this.fb.group({
      baseUrl: [''],
      apiKey: [''],
      apiSecret: [''],
      passphrase: [''],
      username: [''],
      password: [''],
      label: [''],
      permissions: [''],
    });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['account'] && this.account) {
      this.credentialForm.patchValue({
        baseUrl: this.account.baseUrl || '',
        label: this.account.credentials?.label || '',
        permissions: this.account.credentials?.permissions || '',
      });
      this.editMode = false;
    }
  }

  get hasConnection(): boolean {
    return !!this.account?.connectionId;
  }

  get requiredFields(): string[] {
    return this.account?.requiredFields || [];
  }

  isFieldRequired(field: string): boolean {
    return this.requiredFields.includes(field);
  }

  getFieldLabel(field: string): string {
    return this.fieldLabels[field] || field;
  }

  enterEditMode(): void {
    this.editMode = true;
    // Clear sensitive fields — user must re-enter
    this.credentialForm.patchValue({
      apiKey: '',
      apiSecret: '',
      passphrase: '',
      username: '',
      password: '',
    });
  }

  cancelEdit(): void {
    this.editMode = false;
    this.credentialForm.patchValue({
      baseUrl: this.account?.baseUrl || '',
      label: this.account?.credentials?.label || '',
      permissions: this.account?.credentials?.permissions || '',
    });
  }

  onSave(): void {
    if (!this.account) return;

    this.saving = true;
    this.saveMessage = null;

    const formVal = this.credentialForm.value;
    const request: UpdateCredentialsRequest = {
      accountId: this.account.id,
      baseUrl: formVal.baseUrl || undefined,
      label: formVal.label || undefined,
      permissions: formVal.permissions || undefined,
    };

    // Only include credential fields that have values (non-empty = update, empty = skip)
    if (formVal.apiKey) request.apiKey = formVal.apiKey;
    if (formVal.apiSecret) request.apiSecret = formVal.apiSecret;
    if (formVal.passphrase) request.passphrase = formVal.passphrase;
    if (formVal.username) request.username = formVal.username;
    if (formVal.password) request.password = formVal.password;

    this.accountsService.updateCredentials(request).subscribe({
      next: (res) => {
        this.saving = false;
        if (res.responseCode === 200) {
          this.saveMessage = 'Credentials updated successfully';
          this.saveError = false;
          this.editMode = false;
          this.saved.emit();
        } else {
          this.saveMessage = res.responseMessage || 'Failed to update';
          this.saveError = true;
        }
        setTimeout(() => (this.saveMessage = null), 3000);
      },
      error: (err) => {
        this.saving = false;
        this.saveMessage = 'Failed to update credentials';
        this.saveError = true;
        console.error('Credential update error:', err);
        setTimeout(() => (this.saveMessage = null), 3000);
      },
    });
  }
}
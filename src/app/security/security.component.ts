import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MfaService } from '../_services/mfa.service';
import { MfaStatusResponse } from '../auth/auth.models';
import QRCode from 'qrcode';

type SetupStep = 'idle' | 'qr' | 'verify' | 'recovery' | 'disable';

@Component({
  selector: 'app-security',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './security.component.html',
  styleUrl: './security.component.scss'
})
export class SecurityComponent implements OnInit {
  mfaStatus = signal<MfaStatusResponse | null>(null);
  step = signal<SetupStep>('idle');
  loading = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  // Setup state
  qrUri = signal<string>('');
  qrDataUrl = signal<string>('');
  sharedKey = signal<string>('');
  recoveryCodes = signal<string[]>([]);
  recoveryCodesCopied = signal(false);

  // Forms
  verifyForm: FormGroup;
  disableForm: FormGroup;

  constructor(
    private mfa: MfaService,
    private fb: FormBuilder
  ) {
    this.verifyForm = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6), Validators.maxLength(6)]]
    });
    this.disableForm = this.fb.group({
      password: ['', [Validators.required]]
    });
  }

  async ngOnInit(): Promise<void> {
    await this.loadStatus();
  }

  async loadStatus(): Promise<void> {
    try {
      const status = await this.mfa.getStatus();
      this.mfaStatus.set(status);
    } catch {
      this.error.set('Failed to load MFA status.');
    }
  }

  // =============================================
  // SETUP FLOW
  // =============================================

  async beginSetup(): Promise<void> {
    this.error.set(null);
    this.success.set(null);
    this.loading.set(true);

    try {
      const result = await this.mfa.beginSetup();
      this.qrUri.set(result.qrUri);
      this.sharedKey.set(result.sharedKey);

      // Generate QR code as data URL client-side
      const dataUrl = await QRCode.toDataURL(result.qrUri, {
        width: 200,
        margin: 2,
        color: { dark: '#000000', light: '#ffffff' }
      });
      this.qrDataUrl.set(dataUrl);

      this.step.set('qr');
    } catch (err: any) {
      this.error.set(err?.error?.error || 'Failed to start MFA setup.');
    } finally {
      this.loading.set(false);
    }
  }

  proceedToVerify(): void {
    this.step.set('verify');
    this.verifyForm.reset();
  }

  async confirmSetup(): Promise<void> {
    if (this.verifyForm.invalid) {
      this.verifyForm.markAllAsTouched();
      return;
    }

    this.error.set(null);
    this.loading.set(true);

    try {
      const result = await this.mfa.confirmSetup(this.verifyForm.value.code);
      this.recoveryCodes.set(result.recoveryCodes);
      this.step.set('recovery');
      await this.loadStatus();
    } catch (err: any) {
      this.error.set(err?.error?.error || 'Invalid verification code.');
    } finally {
      this.loading.set(false);
    }
  }

  finishSetup(): void {
    this.step.set('idle');
    this.success.set('Two-factor authentication has been enabled.');
    this.qrUri.set('');
    this.qrDataUrl.set('');
    this.sharedKey.set('');
    this.recoveryCodes.set([]);
    this.recoveryCodesCopied.set(false);
  }

  // =============================================
  // DISABLE FLOW
  // =============================================

  startDisable(): void {
    this.step.set('disable');
    this.disableForm.reset();
    this.error.set(null);
    this.success.set(null);
  }

  async confirmDisable(): Promise<void> {
    if (this.disableForm.invalid) {
      this.disableForm.markAllAsTouched();
      return;
    }

    this.error.set(null);
    this.loading.set(true);

    try {
      await this.mfa.disable(this.disableForm.value.password);
      this.step.set('idle');
      this.success.set('Two-factor authentication has been disabled.');
      await this.loadStatus();
    } catch (err: any) {
      this.error.set(err?.error?.error || 'Failed to disable MFA.');
    } finally {
      this.loading.set(false);
    }
  }

  cancelAction(): void {
    this.step.set('idle');
    this.error.set(null);
  }

  // =============================================
  // HELPERS
  // =============================================

  /** Formats the shared key into groups of 4 for readability */
  get formattedKey(): string {
    return this.sharedKey().replace(/(.{4})/g, '$1 ').trim();
  }

  copyRecoveryCodes(): void {
    const text = this.recoveryCodes().join('\n');
    navigator.clipboard.writeText(text).then(() => {
      this.recoveryCodesCopied.set(true);
      setTimeout(() => this.recoveryCodesCopied.set(false), 2000);
    });
  }
}

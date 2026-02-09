import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-mfa-verify',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './mfa-verify.component.html',
  styleUrl: './mfa-verify.component.scss'
})
export class MfaVerifyComponent {
  form: FormGroup;
  error = signal<string | null>(null);
  loading = signal(false);
  useRecoveryCode = signal(false);

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private router: Router
  ) {
    // If there's no MFA token, the user shouldn't be here
    if (!this.auth.mfaToken) {
      this.router.navigateByUrl('/auth/login');
    }

    this.form = this.fb.group({
      code: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  toggleRecoveryCode(): void {
    this.useRecoveryCode.update(v => !v);
    this.form.reset();
    this.error.set(null);

    if (this.useRecoveryCode()) {
      this.form.get('code')?.setValidators([Validators.required, Validators.minLength(4)]);
    } else {
      this.form.get('code')?.setValidators([Validators.required, Validators.minLength(6)]);
    }
    this.form.get('code')?.updateValueAndValidity();
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.error.set(null);
    this.loading.set(true);

    try {
      const code = this.form.value.code.replace(/\s/g, '');
      await this.auth.verifyMfa(code, this.useRecoveryCode());
      // Redirect happens automatically via AuthService (OIDC flow)
    } catch (err: any) {
      this.loading.set(false);
      this.error.set(err?.error?.error || 'Verification failed. Please try again.');
    }
  }

  backToLogin(): void {
    this.router.navigateByUrl('/auth/login');
  }
}

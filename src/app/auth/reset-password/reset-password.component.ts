import { Component, signal, computed, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './reset-password.component.html',
  styleUrl: './reset-password.component.scss'
})
export class ResetPasswordComponent implements OnInit {
  form: FormGroup;
  error = signal<string | null>(null);
  success = signal(false);
  loading = signal(false);
  showPassword = signal(false);

  private email = '';
  private token = '';

  constructor(
    private fb: FormBuilder,
    private auth: AuthService,
    private route: ActivatedRoute
  ) {
    this.form = this.fb.group({
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.email = params['email'] || '';
      this.token = params['token'] || '';

      if (!this.email || !this.token) {
        this.error.set('Invalid or missing reset link. Please request a new one.');
      }
    });
  }

  pw = computed(() => this.form?.get('newPassword')?.value || '');
  hasMinLength = computed(() => this.pw().length >= 8);
  hasUpper = computed(() => /[A-Z]/.test(this.pw()));
  hasLower = computed(() => /[a-z]/.test(this.pw()));
  hasNumber = computed(() => /\d/.test(this.pw()));
  hasSpecial = computed(() => /[^A-Za-z0-9]/.test(this.pw()));

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { newPassword, confirmPassword } = this.form.value;
    if (newPassword !== confirmPassword) {
      this.error.set('Passwords do not match.');
      return;
    }

    this.error.set(null);
    this.loading.set(true);

    try {
      await this.auth.resetPassword(this.email, this.token, newPassword);
      this.success.set(true);
    } catch (err: any) {
      this.error.set(err?.error?.error || 'Failed to reset password. Please try again.');
    } finally {
      this.loading.set(false);
    }
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }
}

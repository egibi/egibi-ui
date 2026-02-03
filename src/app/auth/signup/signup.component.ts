import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  form: FormGroup;
  error = signal<string | null>(null);
  loading = signal(false);
  showPassword = signal(false);

  constructor(
    private fb: FormBuilder,
    private auth: AuthService
  ) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  // Password strength checks
  pw = computed(() => this.form?.get('password')?.value || '');
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

    this.error.set(null);
    this.loading.set(true);

    try {
      const { email, password, firstName, lastName } = this.form.value;
      await this.auth.signup(email, password, firstName, lastName);
    } catch (err: any) {
      this.loading.set(false);
      this.error.set(err?.error?.error || 'Signup failed. Please try again.');
    }
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }
}

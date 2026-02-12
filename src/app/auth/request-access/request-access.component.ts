import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  selector: 'app-request-access',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule],
  templateUrl: './request-access.component.html',
  styleUrls: ['./request-access.component.scss']
})
export class RequestAccessComponent {
  form: FormGroup;
  loading = signal(false);
  error = signal<string | null>(null);
  requestSubmitted = signal(false);

  private apiUrl = environment.apiUrl;

  constructor(private fb: FormBuilder, private http: HttpClient) {
    this.form = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      firstName: ['', [Validators.required]],
      lastName: ['', [Validators.required]],
      message: ['']
    });
  }

  async onSubmit(): Promise<void> {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { email, password, confirmPassword, firstName, lastName, message } = this.form.value;

    if (password !== confirmPassword) {
      this.error.set('Passwords do not match.');
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    try {
      const response = await this.http.post<any>(
        `${this.apiUrl}/AccessRequests/request-access`,
        { email, password, firstName, lastName, message }
      ).toPromise();

      if (response?.responseData?.requestSubmitted) {
        this.requestSubmitted.set(true);
      } else {
        this.error.set(response?.statusMessage || 'An error occurred. Please try again.');
      }
    } catch (err: any) {
      this.loading.set(false);
      const msg = err?.error?.statusMessage
        || err?.error?.message
        || 'An error occurred. Please try again.';
      this.error.set(msg);
    } finally {
      this.loading.set(false);
    }
  }
}

import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-verify-email',
  standalone: true,
  imports: [CommonModule, RouterModule],
  templateUrl: './verify-email.component.html',
  styleUrl: './verify-email.component.scss'
})
export class VerifyEmailComponent implements OnInit {

  loading = signal(true);
  verified = signal(false);
  error = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private auth: AuthService
  ) {}

  async ngOnInit(): Promise<void> {
    const token = this.route.snapshot.queryParamMap.get('token');
    const email = this.route.snapshot.queryParamMap.get('email');

    if (!token || !email) {
      this.error.set('Invalid verification link. Please check your email and try again.');
      this.loading.set(false);
      return;
    }

    try {
      const response = await this.auth.verifyEmail(email, token);
      this.verified.set(true);
    } catch (err: any) {
      this.error.set(err?.error?.error || 'Verification failed. The link may have expired.');
    } finally {
      this.loading.set(false);
    }
  }
}

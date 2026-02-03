import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-auth-callback',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="callback-page">
      @if (error()) {
        <div class="callback-error">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24"
               fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" x2="12" y1="8" y2="12"/>
            <line x1="12" x2="12.01" y1="16" y2="16"/>
          </svg>
          <h2>Authentication Error</h2>
          <p>{{ error() }}</p>
          <a href="/auth/login" class="retry-link">Return to login</a>
        </div>
      } @else {
        <div class="callback-loading">
          <div class="loading-spinner"></div>
          <p>Completing sign in...</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .callback-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: hsl(var(--egibi-background));
    }

    .callback-loading {
      text-align: center;

      p {
        margin-top: 1rem;
        font-size: 0.875rem;
        color: hsl(var(--egibi-muted-foreground));
      }
    }

    .loading-spinner {
      width: 40px;
      height: 40px;
      margin: 0 auto;
      border: 3px solid hsl(var(--egibi-border));
      border-top-color: hsl(var(--egibi-primary));
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .callback-error {
      text-align: center;
      padding: 2rem;

      svg { 
        color: hsl(var(--egibi-danger));
        margin-bottom: 1rem;
      }

      h2 {
        font-size: 1.25rem;
        font-weight: 600;
        color: hsl(var(--egibi-foreground));
        margin: 0 0 0.5rem;
      }

      p {
        font-size: 0.875rem;
        color: hsl(var(--egibi-muted-foreground));
        margin: 0 0 1.5rem;
      }

      .retry-link {
        font-size: 0.875rem;
        color: hsl(var(--egibi-primary));
        text-decoration: none;

        &:hover { text-decoration: underline; }
      }
    }
  `]
})
export class AuthCallbackComponent implements OnInit {
  error = signal<string | null>(null);

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    this.route.queryParams.subscribe(async params => {
      const code = params['code'];
      const state = params['state'];
      const errorParam = params['error'];

      if (errorParam) {
        this.error.set(params['error_description'] || 'Authentication was denied.');
        return;
      }

      if (!code || !state) {
        this.error.set('Missing authorization code. Please try logging in again.');
        return;
      }

      try {
        await this.auth.handleCallback(code, state);
      } catch (err: any) {
        this.error.set(err?.message || 'Failed to complete authentication.');
      }
    });
  }
}

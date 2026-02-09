import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { marked } from 'marked';

@Component({
  selector: 'legal-page',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="legal-page">
      <div class="legal-card">
        <div class="legal-header">
          <a routerLink="/auth/login" class="legal-logo" aria-label="Back to login">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="418 370 300 260" width="32" height="32"
                 role="img" aria-label="Egibi logo">
              <g fill="currentColor" fill-rule="evenodd">
                <path d="M481 459L493 459L494 460L503 460L504 459L507 459L508 458L509 458L510 457L511 457L512 456L513 456L514 455L515 455L516 454L517 454L519 452L520 452L523 449L524 449L525 448L524 447L521 447L520 446L516 446L515 445L512 445L511 444L508 444L507 443L504 443L503 442L495 442L492 445L492 446L490 448L490 449L481 458Z"/>
                <path d="M679 406L522 384L474 437L418 475L442 524L478 526L463 540L448 537L454 559L499 560L522 616L545 608L541 552L562 602L604 581L555 505L517 491L510 522L447 512L437 490L451 474L441 471L477 447L497 422L596 410L587 433L557 447L573 466L559 498L620 568L665 535L599 472L673 514L695 481L623 439L688 461ZM598 471L599 470L600 471L599 472ZM596 470L597 469L598 469L599 470L598 471L597 471Z"/>
              </g>
            </svg>
            <span>egibi</span>
          </a>
        </div>

        @if (loading) {
          <div class="legal-loading">
            <div class="spinner"></div>
          </div>
        } @else {
          <div class="legal-content" [innerHTML]="renderedHtml"></div>
        }

        <div class="legal-footer">
          <a routerLink="/auth/login">← Back to login</a>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .legal-page {
      min-height: 100vh;
      background: hsl(var(--egibi-background, 0 0% 100%));
      padding: 2rem 1rem;
      display: flex;
      justify-content: center;
    }

    .legal-card {
      width: 100%;
      max-width: 800px;
    }

    .legal-header {
      margin-bottom: 2rem;
      padding-bottom: 1rem;
      border-bottom: 1px solid hsl(var(--egibi-border, 220 13% 91%));
    }

    .legal-logo {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      text-decoration: none;
      color: hsl(var(--egibi-foreground, 224 71% 4%));
      font-size: 1.25rem;
      font-weight: 600;
      letter-spacing: -0.02em;
    }

    .legal-loading {
      display: flex;
      justify-content: center;
      padding: 3rem 0;
    }

    .spinner {
      width: 24px;
      height: 24px;
      border: 2px solid hsl(var(--egibi-muted, 220 14% 96%));
      border-top-color: hsl(var(--egibi-primary, 222 47% 11%));
      border-radius: 50%;
      animation: spin 0.6s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .legal-content {
      color: hsl(var(--egibi-foreground, 224 71% 4%));
      font-size: 0.9rem;
      line-height: 1.7;

      :deep(h1) {
        font-size: 1.5rem;
        font-weight: 700;
        margin-bottom: 0.25rem;
      }

      :deep(h2) {
        font-size: 1.15rem;
        font-weight: 600;
        margin-top: 2rem;
        margin-bottom: 0.75rem;
        padding-bottom: 0.375rem;
        border-bottom: 1px solid hsl(var(--egibi-border, 220 13% 91%));
      }

      :deep(h3) {
        font-size: 1rem;
        font-weight: 600;
        margin-top: 1.25rem;
        margin-bottom: 0.5rem;
      }

      :deep(p) {
        margin-bottom: 0.75rem;
      }

      :deep(ul), :deep(ol) {
        padding-left: 1.5rem;
        margin-bottom: 0.75rem;
      }

      :deep(li) {
        margin-bottom: 0.375rem;
      }

      :deep(a) {
        color: hsl(var(--egibi-primary, 222 47% 11%));
        text-decoration: underline;
      }

      :deep(strong) {
        font-weight: 600;
      }

      :deep(hr) {
        margin: 2rem 0;
        border: none;
        border-top: 1px solid hsl(var(--egibi-border, 220 13% 91%));
      }

      :deep(table) {
        width: 100%;
        border-collapse: collapse;
        margin-bottom: 1rem;
        font-size: 0.85rem;
      }

      :deep(th), :deep(td) {
        padding: 0.5rem 0.75rem;
        border: 1px solid hsl(var(--egibi-border, 220 13% 91%));
        text-align: left;
      }

      :deep(th) {
        background: hsl(var(--egibi-muted, 220 14% 96%));
        font-weight: 600;
      }
    }

    .legal-footer {
      margin-top: 2rem;
      padding-top: 1rem;
      border-top: 1px solid hsl(var(--egibi-border, 220 13% 91%));

      a {
        font-size: 0.875rem;
        color: hsl(var(--egibi-muted-foreground, 220 9% 46%));
        text-decoration: none;

        &:hover {
          color: hsl(var(--egibi-foreground, 224 71% 4%));
        }
      }
    }
  `]
})
export class LegalPageComponent implements OnInit {
  private http = inject(HttpClient);
  private route = inject(ActivatedRoute);

  renderedHtml = '';
  loading = true;

  ngOnInit() {
    const doc = this.route.snapshot.data['document'] || 'privacy-policy';
    this.http.get(`assets/docs/${doc}.md`, { responseType: 'text' }).subscribe({
      next: (markdown) => {
        this.renderedHtml = marked.parse(markdown, { async: false }) as string;
        this.loading = false;
      },
      error: () => {
        this.renderedHtml = '<p>Document not found.</p>';
        this.loading = false;
      }
    });
  }
}

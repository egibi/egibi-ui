import { Component, signal, computed, inject, TemplateRef, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { marked } from 'marked';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NgbModalModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent {
  private http = inject(HttpClient);
  private modalService = inject(NgbModal);

  @ViewChild('legalModal') legalModal!: TemplateRef<any>;
  @ViewChild('modalBody') modalBody!: ElementRef<HTMLDivElement>;

  form: FormGroup;
  error = signal<string | null>(null);
  loading = signal(false);
  showPassword = signal(false);

  legalTitle = signal('');
  legalHtml = signal('');
  legalLoading = signal(false);
  showScrollTop = signal(false);

  constructor(
    private fb: FormBuilder,
    private auth: AuthService
  ) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      consentToTerms: [false, [Validators.requiredTrue]]
    });
  }

  // Password strength checks
  pw = computed(() => this.form?.get('password')?.value || '');
  hasMinLength = computed(() => this.pw().length >= 8);
  hasUpper = computed(() => /[A-Z]/.test(this.pw()));
  hasLower = computed(() => /[a-z]/.test(this.pw()));
  hasNumber = computed(() => /\d/.test(this.pw()));
  hasSpecial = computed(() => /[^A-Za-z0-9]/.test(this.pw()));

  openLegalDoc(doc: 'privacy-policy' | 'terms-of-service', event: Event): void {
    event.preventDefault();
    this.legalTitle.set(doc === 'privacy-policy' ? 'Privacy Policy' : 'Terms of Service');
    this.legalHtml.set('');
    this.legalLoading.set(true);
    this.showScrollTop.set(false);

    this.modalService.open(this.legalModal, {
      size: 'lg',
      centered: true,
      scrollable: true
    });

    this.http.get(`assets/docs/${doc}.md`, { responseType: 'text' }).subscribe({
      next: (markdown) => {
        this.legalHtml.set(marked.parse(markdown, { async: false }) as string);
        this.legalLoading.set(false);
      },
      error: () => {
        this.legalHtml.set('<p>Document not found.</p>');
        this.legalLoading.set(false);
      }
    });
  }

  onModalScroll(event: Event): void {
    const el = event.target as HTMLElement;
    this.showScrollTop.set(el.scrollTop > 300);
  }

  scrollModalToTop(): void {
    this.modalBody?.nativeElement?.scrollTo({ top: 0, behavior: 'smooth' });
  }

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

import { Component, signal, computed, inject, TemplateRef, ViewChild, ElementRef, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { NgbModal, NgbModalModule } from '@ng-bootstrap/ng-bootstrap';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { marked } from 'marked';
import { AuthService } from '../auth.service';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, NgbModalModule],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.scss'
})
export class SignupComponent implements OnInit {
  private http = inject(HttpClient);
  private modalService = inject(NgbModal);
  private destroyRef = inject(DestroyRef);

  @ViewChild('legalModal') legalModal!: TemplateRef<any>;
  @ViewChild('modalBody') modalBody!: ElementRef<HTMLDivElement>;

  form: FormGroup;
  error = signal<string | null>(null);
  loading = signal(false);
  showPassword = signal(false);
  showConfirmPassword = signal(false);

  /** True after a successful access request submission */
  requestSubmitted = signal(false);

  /** The email address used for the submitted request (shown in success message) */
  submittedEmail = signal('');

  /** Resend verification state */
  resendLoading = signal(false);
  resendSuccess = signal(false);

  legalTitle = signal('');
  legalHtml = signal('');
  legalLoading = signal(false);
  showScrollTop = signal(false);

  // Password strength — driven by a signal that updates on valueChanges
  pw = signal('');
  hasMinLength = computed(() => this.pw().length >= 8);
  hasUpper = computed(() => /[A-Z]/.test(this.pw()));
  hasLower = computed(() => /[a-z]/.test(this.pw()));
  hasNumber = computed(() => /\d/.test(this.pw()));
  hasSpecial = computed(() => /[^A-Za-z0-9]/.test(this.pw()));

  constructor(
    private fb: FormBuilder,
    private auth: AuthService
  ) {
    this.form = this.fb.group({
      firstName: ['', [Validators.required, Validators.maxLength(100)]],
      lastName: ['', [Validators.required, Validators.maxLength(100)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', [Validators.required]],
      consentToTerms: [false, [Validators.requiredTrue]]
    }, {
      validators: SignupComponent.passwordsMatchValidator
    });
  }

  ngOnInit(): void {
    // Pipe reactive form valueChanges into the pw signal so computed() picks up changes
    this.form.get('password')!.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(val => this.pw.set(val || ''));
  }

  /** Cross-field validator: confirmPassword must match password */
  static passwordsMatchValidator(group: AbstractControl): ValidationErrors | null {
    const password = group.get('password')?.value;
    const confirm = group.get('confirmPassword')?.value;
    if (confirm && password !== confirm) {
      return { passwordsMismatch: true };
    }
    return null;
  }

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
      const response = await this.auth.signup(email, password, firstName, lastName);

      this.loading.set(false);

      if (response.accessRequestSubmitted) {
        this.submittedEmail.set(email);
        this.requestSubmitted.set(true);
      }
    } catch (err: any) {
      this.loading.set(false);
      this.error.set(err?.error?.error || 'Request failed. Please try again.');
    }
  }

  async resendVerification(): Promise<void> {
    const email = this.submittedEmail();
    if (!email) return;

    this.resendLoading.set(true);
    this.resendSuccess.set(false);

    try {
      await this.auth.resendVerification(email);
      this.resendSuccess.set(true);
    } catch (err: any) {
      // Silently handle — the user can try again
    } finally {
      this.resendLoading.set(false);
    }
  }

  togglePassword(): void {
    this.showPassword.update(v => !v);
  }

  toggleConfirmPassword(): void {
    this.showConfirmPassword.update(v => !v);
  }
}

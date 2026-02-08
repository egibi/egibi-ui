import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  LoginRequest, SignupRequest, ForgotPasswordRequest, ResetPasswordRequest,
  AuthResponse, OidcTokenResponse, UserProfile
} from './auth.models';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // FIX #8: Use centralized environment config instead of hardcoded URLs
  private readonly apiUrl = environment.apiUrl;
  private readonly clientId = 'egibi-ui';
  private readonly redirectUri = `${window.location.origin}/auth/callback`;
  private readonly scopes = 'openid email profile roles api offline_access';

  // --- State ---
  private _accessToken = signal<string | null>(null);
  private _refreshToken = signal<string | null>(null);
  private _user = signal<UserProfile | null>(null);
  private _loading = signal<boolean>(false);
  private _initialized = signal<boolean>(false);

  // FIX #18: Track token expiry time instead of using fragile setTimeout
  private _tokenExpiresAt: number | null = null;
  private _refreshPromise: Promise<boolean> | null = null;

  /** Promise that resolves when initial session restore (including token refresh) is complete */
  readonly whenInitialized: Promise<void>;

  /** Current user profile (null if not authenticated) */
  user = this._user.asReadonly();

  /** Whether the user is authenticated */
  isAuthenticated = computed(() => !!this._accessToken() && !!this._user());

  /** Loading state for auth operations */
  loading = this._loading.asReadonly();

  /** Whether initial token check is complete */
  initialized = this._initialized.asReadonly();

  /** Current user's role */
  userRole = computed(() => this._user()?.role ?? null);

  /** Whether the current user is an admin */
  isAdmin = computed(() => this._user()?.role === 'admin');

  /** Current access token (for interceptor) */
  get accessToken(): string | null {
    return this._accessToken();
  }

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Restore session and wait for refresh to complete before marking initialized
    this.whenInitialized = this.restoreSession();
  }

  // =============================================
  // LOGIN
  // =============================================

  /**
   * Step 1: Authenticate with email/password → sets server cookie.
   * Step 2: Initiate OIDC Authorization Code + PKCE flow.
   */
  async login(email: string, password: string): Promise<void> {
    this._loading.set(true);

    try {
      // POST credentials to set the auth cookie on the API domain
      await firstValueFrom(
        this.http.post<AuthResponse>(`${this.apiUrl}/auth/login`,
          { email, password } as LoginRequest,
          { withCredentials: true }
        )
      );

      // Cookie is set — now start OIDC Authorization Code + PKCE flow
      this.startAuthorizationFlow();
    } catch (err: any) {
      this._loading.set(false);
      throw err;
    }
  }

  // =============================================
  // SIGNUP
  // =============================================

  /**
   * Create account, auto-login (sets cookie), then start OIDC flow.
   */
  async signup(email: string, password: string, firstName: string, lastName: string): Promise<void> {
    this._loading.set(true);

    try {
      await firstValueFrom(
        this.http.post<AuthResponse>(`${this.apiUrl}/auth/signup`,
          { email, password, firstName, lastName } as SignupRequest,
          { withCredentials: true }
        )
      );

      // Cookie is set — start OIDC flow
      this.startAuthorizationFlow();
    } catch (err: any) {
      this._loading.set(false);
      throw err;
    }
  }

  // =============================================
  // PASSWORD RESET
  // =============================================

  async forgotPassword(email: string): Promise<AuthResponse> {
    return firstValueFrom(
      this.http.post<AuthResponse>(`${this.apiUrl}/auth/forgot-password`, { email } as ForgotPasswordRequest)
    );
  }

  async resetPassword(email: string, token: string, newPassword: string): Promise<AuthResponse> {
    return firstValueFrom(
      this.http.post<AuthResponse>(`${this.apiUrl}/auth/reset-password`,
        { email, token, newPassword } as ResetPasswordRequest
      )
    );
  }

  // =============================================
  // OIDC AUTHORIZATION CODE + PKCE FLOW
  // =============================================

  /**
   * Generates PKCE verifier/challenge, stores verifier, and redirects to /connect/authorize.
   */
  private startAuthorizationFlow(): void {
    const codeVerifier = this.generateCodeVerifier();
    localStorage.setItem('oidc_code_verifier', codeVerifier);

    this.generateCodeChallenge(codeVerifier).then(codeChallenge => {
      const state = this.generateRandomString(32);
      localStorage.setItem('oidc_state', state);

      const params = new URLSearchParams({
        client_id: this.clientId,
        redirect_uri: this.redirectUri,
        response_type: 'code',
        scope: this.scopes,
        code_challenge: codeChallenge,
        code_challenge_method: 'S256',
        state: state
      });

      // Full-page redirect to the authorization endpoint.
      // The server sees the EgibiCookie and auto-approves.
      window.location.href = `${this.apiUrl}/connect/authorize?${params.toString()}`;
    });
  }

  /**
   * Called by the /auth/callback route after the server redirects back with an auth code.
   */
  async handleCallback(code: string, state: string): Promise<void> {
    this._loading.set(true);

    // Validate state to prevent CSRF
    const expectedState = localStorage.getItem('oidc_state');
    if (state !== expectedState) {
      this._loading.set(false);
      throw new Error('Invalid state parameter. Possible CSRF attack.');
    }

    const codeVerifier = localStorage.getItem('oidc_code_verifier');
    if (!codeVerifier) {
      this._loading.set(false);
      throw new Error('Missing PKCE code verifier.');
    }

    // Clean up
    localStorage.removeItem('oidc_state');
    localStorage.removeItem('oidc_code_verifier');

    try {
      // Exchange auth code for tokens
      const body = new HttpParams()
        .set('grant_type', 'authorization_code')
        .set('client_id', this.clientId)
        .set('code', code)
        .set('redirect_uri', this.redirectUri)
        .set('code_verifier', codeVerifier);

      const tokenResponse = await firstValueFrom(
        this.http.post<OidcTokenResponse>(`${this.apiUrl}/connect/token`, body.toString(), {
          headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
        })
      );

      this.setTokens(tokenResponse);

      // Fetch user profile
      await this.fetchUserProfile();

      this._loading.set(false);
      this._initialized.set(true);

      // Navigate to the originally requested page, or home
      const returnUrl = localStorage.getItem('auth_return_url') || '/';
      localStorage.removeItem('auth_return_url');
      this.router.navigateByUrl(returnUrl);
    } catch (err) {
      this._loading.set(false);
      this.clearSession();
      throw err;
    }
  }

  // =============================================
  // TOKEN REFRESH
  // =============================================

  /**
   * FIX #18: Deduplicates concurrent refresh calls.
   * If a refresh is already in-flight, returns the same promise.
   */
  async refreshAccessToken(): Promise<boolean> {
    // Deduplicate concurrent calls
    if (this._refreshPromise) {
      return this._refreshPromise;
    }

    const refreshToken = this._refreshToken();
    if (!refreshToken) return false;

    this._refreshPromise = this._doRefresh(refreshToken);

    try {
      return await this._refreshPromise;
    } finally {
      this._refreshPromise = null;
    }
  }

  private async _doRefresh(refreshToken: string): Promise<boolean> {
    try {
      const body = new HttpParams()
        .set('grant_type', 'refresh_token')
        .set('client_id', this.clientId)
        .set('refresh_token', refreshToken);

      const tokenResponse = await firstValueFrom(
        this.http.post<OidcTokenResponse>(`${this.apiUrl}/connect/token`, body.toString(), {
          headers: new HttpHeaders({ 'Content-Type': 'application/x-www-form-urlencoded' })
        })
      );

      this.setTokens(tokenResponse);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * FIX #18: Check if token is about to expire (proactive refresh).
   * Called by the interceptor before each API request.
   */
  isTokenExpiringSoon(): boolean {
    if (!this._tokenExpiresAt) return false;
    // Refresh if within 60 seconds of expiry
    return Date.now() >= (this._tokenExpiresAt - 60_000);
  }

  // =============================================
  // LOGOUT
  // =============================================

  async logout(): Promise<void> {
    try {
      // Notify the server to clean up tokens
      await firstValueFrom(
        this.http.post(`${this.apiUrl}/connect/logout`, null, {
          withCredentials: true
        })
      ).catch(() => {/* best-effort */});
    } finally {
      this.clearSession();
      this.router.navigateByUrl('/auth/login');
    }
  }

  // =============================================
  // USER PROFILE
  // =============================================

  private async fetchUserProfile(): Promise<void> {
    const profile = await firstValueFrom(
      this.http.get<UserProfile>(`${this.apiUrl}/connect/userinfo`, {
        headers: new HttpHeaders({
          Authorization: `Bearer ${this._accessToken()}`
        })
      })
    );
    this._user.set(profile);
    localStorage.setItem('oidc_user', JSON.stringify(profile));
  }

  // =============================================
  // SESSION MANAGEMENT
  // =============================================

  private setTokens(response: OidcTokenResponse): void {
    this._accessToken.set(response.access_token);
    localStorage.setItem('oidc_access_token', response.access_token);

    if (response.refresh_token) {
      this._refreshToken.set(response.refresh_token);
      localStorage.setItem('oidc_refresh_token', response.refresh_token);
    }

    // FIX #18: Track expiry time instead of using setTimeout
    if (response.expires_in) {
      this._tokenExpiresAt = Date.now() + (response.expires_in * 1000);
      localStorage.setItem('oidc_token_expires_at', this._tokenExpiresAt.toString());
    }
  }

  private async restoreSession(): Promise<void> {
    const accessToken = localStorage.getItem('oidc_access_token');
    const refreshToken = localStorage.getItem('oidc_refresh_token');
    const userJson = localStorage.getItem('oidc_user');
    const expiresAt = localStorage.getItem('oidc_token_expires_at');

    if (accessToken && userJson) {
      this._accessToken.set(accessToken);
      this._refreshToken.set(refreshToken);
      this._user.set(JSON.parse(userJson));
      this._tokenExpiresAt = expiresAt ? parseInt(expiresAt, 10) : null;

      // Try to refresh the token silently.
      // If it succeeds, we get a fresh access token.
      // If it fails, keep the existing session — the access token may still be valid.
      // The interceptor will handle actual 401s and trigger logout if truly expired.
      if (refreshToken) {
        await this.refreshAccessToken();
      }
    }

    this._initialized.set(true);
  }

  private clearSession(): void {
    this._accessToken.set(null);
    this._refreshToken.set(null);
    this._user.set(null);
    this._tokenExpiresAt = null;
    this._refreshPromise = null;
    localStorage.removeItem('oidc_access_token');
    localStorage.removeItem('oidc_refresh_token');
    localStorage.removeItem('oidc_user');
    localStorage.removeItem('oidc_code_verifier');
    localStorage.removeItem('oidc_state');
    localStorage.removeItem('oidc_token_expires_at');
  }

  // =============================================
  // PKCE HELPERS
  // =============================================

  private generateCodeVerifier(): string {
    return this.generateRandomString(64);
  }

  private async generateCodeChallenge(verifier: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(verifier);
    const hash = await crypto.subtle.digest('SHA-256', data);
    return this.base64UrlEncode(new Uint8Array(hash));
  }

  private generateRandomString(length: number): string {
    const array = new Uint8Array(length);
    crypto.getRandomValues(array);
    return this.base64UrlEncode(array).substring(0, length);
  }

  private base64UrlEncode(buffer: Uint8Array): string {
    let binary = '';
    buffer.forEach(byte => binary += String.fromCharCode(byte));
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
}

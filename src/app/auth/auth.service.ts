import { Injectable, signal, computed } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders } from '@angular/common/http';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  LoginRequest, SignupRequest, ForgotPasswordRequest, ResetPasswordRequest,
  AuthResponse, OidcTokenResponse, UserProfile
} from './auth.models';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  // --- Configuration ---
  private readonly apiUrl = 'https://localhost:7182';
  private readonly clientId = 'egibi-ui';
  private readonly redirectUri = 'http://localhost:4200/auth/callback';
  private readonly scopes = 'openid email profile roles api offline_access';

  // --- State ---
  private _accessToken = signal<string | null>(null);
  private _refreshToken = signal<string | null>(null);
  private _user = signal<UserProfile | null>(null);
  private _loading = signal<boolean>(false);
  private _initialized = signal<boolean>(false);

  /** Current user profile (null if not authenticated) */
  user = this._user.asReadonly();

  /** Whether the user is authenticated */
  isAuthenticated = computed(() => !!this._accessToken() && !!this._user());

  /** Loading state for auth operations */
  loading = this._loading.asReadonly();

  /** Whether initial token check is complete */
  initialized = this._initialized.asReadonly();

  /** Current access token (for interceptor) */
  get accessToken(): string | null {
    return this._accessToken();
  }

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    // Try to restore session from sessionStorage
    this.restoreSession();
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
    sessionStorage.setItem('oidc_code_verifier', codeVerifier);

    this.generateCodeChallenge(codeVerifier).then(codeChallenge => {
      const state = this.generateRandomString(32);
      sessionStorage.setItem('oidc_state', state);

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
    const expectedState = sessionStorage.getItem('oidc_state');
    if (state !== expectedState) {
      this._loading.set(false);
      throw new Error('Invalid state parameter. Possible CSRF attack.');
    }

    const codeVerifier = sessionStorage.getItem('oidc_code_verifier');
    if (!codeVerifier) {
      this._loading.set(false);
      throw new Error('Missing PKCE code verifier.');
    }

    // Clean up
    sessionStorage.removeItem('oidc_state');
    sessionStorage.removeItem('oidc_code_verifier');

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
      const returnUrl = sessionStorage.getItem('auth_return_url') || '/';
      sessionStorage.removeItem('auth_return_url');
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

  async refreshAccessToken(): Promise<boolean> {
    const refreshToken = this._refreshToken();
    if (!refreshToken) return false;

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
      this.clearSession();
      return false;
    }
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
    sessionStorage.setItem('oidc_user', JSON.stringify(profile));
  }

  // =============================================
  // SESSION MANAGEMENT
  // =============================================

  private setTokens(response: OidcTokenResponse): void {
    this._accessToken.set(response.access_token);
    sessionStorage.setItem('oidc_access_token', response.access_token);

    if (response.refresh_token) {
      this._refreshToken.set(response.refresh_token);
      sessionStorage.setItem('oidc_refresh_token', response.refresh_token);
    }

    // Schedule token refresh before expiry
    if (response.expires_in) {
      const refreshMs = (response.expires_in - 60) * 1000; // Refresh 60s before expiry
      setTimeout(() => this.refreshAccessToken(), Math.max(refreshMs, 5000));
    }
  }

  private restoreSession(): void {
    const accessToken = sessionStorage.getItem('oidc_access_token');
    const refreshToken = sessionStorage.getItem('oidc_refresh_token');
    const userJson = sessionStorage.getItem('oidc_user');

    if (accessToken && userJson) {
      this._accessToken.set(accessToken);
      this._refreshToken.set(refreshToken);
      this._user.set(JSON.parse(userJson));
      this._initialized.set(true);

      // Try a silent refresh to make sure the token is still valid
      this.refreshAccessToken().then(success => {
        if (!success && refreshToken) {
          this.clearSession();
        }
      });
    } else {
      this._initialized.set(true);
    }
  }

  private clearSession(): void {
    this._accessToken.set(null);
    this._refreshToken.set(null);
    this._user.set(null);
    sessionStorage.removeItem('oidc_access_token');
    sessionStorage.removeItem('oidc_refresh_token');
    sessionStorage.removeItem('oidc_user');
    sessionStorage.removeItem('oidc_code_verifier');
    sessionStorage.removeItem('oidc_state');
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

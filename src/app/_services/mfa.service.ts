import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../environments/environment';
import {
  MfaStatusResponse,
  MfaSetupResponse,
  MfaConfirmResponse,
  MfaDisableRequest
} from '../auth/auth.models';

@Injectable({
  providedIn: 'root'
})
export class MfaService {

  private readonly apiUrl = environment.apiUrl;

  constructor(private http: HttpClient) {}

  /** Get current MFA status for the authenticated user */
  getStatus(): Promise<MfaStatusResponse> {
    return firstValueFrom(
      this.http.get<MfaStatusResponse>(`${this.apiUrl}/api/mfa/status`)
    );
  }

  /** Initiate MFA setup — returns shared key and QR URI */
  beginSetup(): Promise<MfaSetupResponse> {
    return firstValueFrom(
      this.http.post<MfaSetupResponse>(`${this.apiUrl}/api/mfa/setup`, {})
    );
  }

  /** Confirm MFA setup with a TOTP code — returns recovery codes */
  confirmSetup(code: string): Promise<MfaConfirmResponse> {
    return firstValueFrom(
      this.http.post<MfaConfirmResponse>(`${this.apiUrl}/api/mfa/confirm`, { code })
    );
  }

  /** Disable MFA — requires password confirmation */
  disable(password: string): Promise<{ message: string }> {
    return firstValueFrom(
      this.http.post<{ message: string }>(`${this.apiUrl}/api/mfa/disable`, { password } as MfaDisableRequest)
    );
  }
}

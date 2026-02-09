export interface LoginRequest {
  email: string;
  password: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  email: string;
  token: string;
  newPassword: string;
}

export interface AuthResponse {
  message?: string;
  email?: string;
  role?: string;
  firstName?: string;
  lastName?: string;
  mfaRequired?: boolean;
  mfaToken?: string;
}

export interface AuthError {
  error: string;
}

export interface OidcTokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token?: string;
  id_token?: string;
  scope?: string;
}

export interface UserProfile {
  sub: string;
  email?: string;
  name?: string;
  given_name?: string;
  family_name?: string;
  role?: string;
}

// =============================================
// MFA MODELS
// =============================================

export interface MfaVerifyLoginRequest {
  mfaToken: string;
  code?: string;
  recoveryCode?: string;
}

export interface MfaStatusResponse {
  isMfaEnabled: boolean;
  remainingRecoveryCodes: number;
}

export interface MfaSetupResponse {
  sharedKey: string;
  qrUri: string;
}

export interface MfaConfirmResponse {
  message: string;
  recoveryCodes: string[];
}

export interface MfaDisableRequest {
  password: string;
}

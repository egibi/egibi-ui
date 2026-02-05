/** Full account detail returned from GET /Accounts/get-account-detail */
export interface AccountDetailResponse {
  id: number;
  name: string;
  description: string;
  notes: string;
  isActive: boolean;
  createdAt: string;
  lastModifiedAt: string | null;

  // Connection / service info
  connectionId: number | null;
  connectionName: string;
  connectionIconKey: string;
  connectionColor: string;
  connectionCategory: string;
  connectionWebsite: string;
  baseUrl: string;
  requiredFields: string[];

  // Account type
  accountTypeId: number | null;
  accountTypeName: string;

  // Masked credentials
  credentials: CredentialSummary | null;

  // Fee structure
  fees: AccountFeeDetail | null;
}

export interface CredentialSummary {
  hasCredentials: boolean;
  label: string;
  maskedApiKey: string;
  maskedApiSecret: string;
  hasPassphrase: boolean;
  hasUsername: boolean;
  permissions: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
}

export interface AccountFeeDetail {
  id: number | null;
  makerFeePercent: number;
  takerFeePercent: number;
  feeScheduleType: string;
  notes: string;
}

/** Request body for PUT /Accounts/update-account */
export interface UpdateAccountRequest {
  id: number;
  name: string;
  description: string;
  notes: string;
  accountTypeId: number | null;
  isActive: boolean;
}

/** Request body for PUT /Accounts/update-credentials */
export interface UpdateCredentialsRequest {
  accountId: number;
  apiKey?: string;
  apiSecret?: string;
  passphrase?: string;
  username?: string;
  password?: string;
  label?: string;
  permissions?: string;
  baseUrl?: string;
}

/** Request body for PUT /Accounts/update-fees */
export interface UpdateAccountFeesRequest {
  accountId: number;
  makerFeePercent: number;
  takerFeePercent: number;
  feeScheduleType: string;
  notes?: string;
}

/** Response from POST /Accounts/test-connection */
export interface TestConnectionResponse {
  success: boolean;
  statusCode: number;
  responseTimeMs: number;
  message: string;
  testedAt: string;
}

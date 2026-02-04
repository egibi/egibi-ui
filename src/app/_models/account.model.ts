import { EntityBase } from './entity-base.model';

export class Account extends EntityBase {
  isNewAccount: boolean = false;

  // Service link
  connectionId: number | null = null;
  connectionName: string = '';
  connectionIconKey: string = '';
  connectionColor: string = '';
  connectionCategory: string = '';

  // Account type
  accountTypeId: number | null = null;
  accountTypeName: string = '';

  // App user (OIDC authenticated)
  appUserId: number | null = null;

  // Credential summary (never plaintext — masked by API)
  hasCredentials: boolean = false;
  credentialLabel: string = '';
  maskedApiKey: string = '';
  credentialLastUsedAt: Date | null = null;
}

/** Request body for creating an account with credentials */
export interface CreateAccountRequest {
  name: string;
  description?: string;
  connectionId: number | null;
  accountTypeId?: number | null;
  baseUrl?: string;
  credentials?: AccountCredentials;
}

/** Plaintext credentials submitted during account creation — API encrypts before storage */
export interface AccountCredentials {
  apiKey?: string;
  apiSecret?: string;
  passphrase?: string;
  username?: string;
  password?: string;
  label?: string;
  permissions?: string;
}

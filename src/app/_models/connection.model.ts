import { EntityBase } from './entity-base.model';

export class Connection extends EntityBase {
  // Legacy fields
  baseUrl: string = '';
  apiKey: string = '';
  apiSecretKey: string = '';
  isDataSource: boolean = false;
  connectionTypeId: number | null = null;

  // Service catalog fields
  category: string = '';           // crypto_exchange, stock_broker, data_provider, other
  iconKey: string = '';            // binance, coinbase, schwab, etc.
  color: string = '';              // Brand hex color
  website: string = '';            // Service website URL
  defaultBaseUrl: string = '';     // Pre-filled API base URL
  requiredFields: string = '[]';  // JSON array of required credential field keys
  sortOrder: number = 0;

  /** Parse requiredFields JSON to string array */
  get requiredFieldsList(): string[] {
    try {
      return JSON.parse(this.requiredFields || '[]');
    } catch {
      return [];
    }
  }
}

/** Display labels for credential field keys */
export const CREDENTIAL_FIELD_LABELS: Record<string, string> = {
  api_key: 'API Key',
  api_secret: 'API Secret',
  passphrase: 'Passphrase',
  username: 'Username',
  password: 'Password',
  base_url: 'Base URL',
};

/** All possible credential field keys */
export const ALL_CREDENTIAL_FIELDS = ['api_key', 'api_secret', 'passphrase', 'username', 'password', 'base_url'];

/** Service category display labels */
export const SERVICE_CATEGORIES: { value: string; label: string }[] = [
  { value: 'crypto_exchange', label: 'Crypto Exchange' },
  { value: 'stock_broker', label: 'Stock Broker' },
  { value: 'data_provider', label: 'Data Provider' },
  { value: 'other', label: 'Other' },
];

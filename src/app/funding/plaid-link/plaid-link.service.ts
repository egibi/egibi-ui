import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, from, of } from 'rxjs';
import { map, switchMap } from 'rxjs/operators';
import { RequestResponse } from '../../request-response';

declare global {
  interface Window {
    Plaid: any;
  }
}

export interface PlaidLinkResult {
  publicToken: string;
  metadata: {
    institution: {
      institution_id: string;
      name: string;
    };
    accounts: {
      id: string;
      name: string;
      mask: string;
      type: string;
      subtype: string;
    }[];
    link_session_id: string;
  };
}

export interface PlaidFundingDetails {
  plaidItemId: number;
  institutionId: string;
  institutionName: string;
  lastSyncedAt: string | null;
  plaidAccountId: string;
  accountName: string;
  mask: string;
  accountType: string;
  accountSubtype: string;
  availableBalance: number | null;
  currentBalance: number | null;
  isoCurrencyCode: string;
  balanceLastUpdatedAt: string | null;
}

@Injectable({
  providedIn: 'root',
})
export class PlaidLinkService {
  private plaidScriptLoaded = false;
  private plaidScriptLoading = false;
  private scriptLoadPromise: Promise<void> | null = null;

  private apiBaseUrl = 'https://localhost:7182/Plaid';

  constructor(private http: HttpClient) {}

  // =============================================
  // SCRIPT LOADING
  // =============================================

  /** Load the Plaid Link SDK script from CDN */
  private loadScript(): Promise<void> {
    if (this.plaidScriptLoaded) return Promise.resolve();
    if (this.scriptLoadPromise) return this.scriptLoadPromise;

    this.plaidScriptLoading = true;
    this.scriptLoadPromise = new Promise<void>((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdn.plaid.com/link/v2/stable/link-initialize.js';
      script.async = true;
      script.onload = () => {
        this.plaidScriptLoaded = true;
        this.plaidScriptLoading = false;
        resolve();
      };
      script.onerror = () => {
        this.plaidScriptLoading = false;
        this.scriptLoadPromise = null;
        reject(new Error('Failed to load Plaid Link SDK'));
      };
      document.head.appendChild(script);
    });

    return this.scriptLoadPromise;
  }

  // =============================================
  // PLAID LINK FLOW
  // =============================================

  /**
   * Opens Plaid Link for the user:
   * 1. Loads Plaid SDK if not already loaded
   * 2. Gets a link_token from the backend
   * 3. Opens Plaid Link modal
   * 4. Returns the public_token and metadata on success
   */
  openPlaidLink(): Observable<PlaidLinkResult> {
    return from(this.loadScript()).pipe(
      switchMap(() => this.createLinkToken()),
      switchMap((res) => {
        const linkToken = res.responseData?.linkToken;
        if (!linkToken) {
          throw new Error('Failed to get link token from server');
        }
        return this.launchLink(linkToken);
      })
    );
  }

  /** Create a Plaid link_token via the backend */
  createLinkToken(): Observable<RequestResponse> {
    return this.http.post<RequestResponse>(`${this.apiBaseUrl}/create-link-token`, {});
  }

  /** Launch the Plaid Link widget and return result as Observable */
  private launchLink(linkToken: string): Observable<PlaidLinkResult> {
    return new Observable<PlaidLinkResult>((subscriber) => {
      if (!window.Plaid) {
        subscriber.error(new Error('Plaid SDK not loaded'));
        return;
      }

      const handler = window.Plaid.create({
        token: linkToken,
        onSuccess: (publicToken: string, metadata: any) => {
          subscriber.next({ publicToken, metadata });
          subscriber.complete();
        },
        onExit: (err: any, metadata: any) => {
          if (err) {
            subscriber.error(err);
          } else {
            // User closed without completing — not an error, just complete
            subscriber.complete();
          }
        },
        onEvent: (eventName: string, metadata: any) => {
          // Could log events here for analytics
        },
      });

      handler.open();
    });
  }

  // =============================================
  // BACKEND API CALLS
  // =============================================

  /** Exchange public_token and create funding source */
  exchangeToken(request: {
    publicToken: string;
    selectedAccountId: string;
    accountName?: string;
    institution?: { institutionId: string; name: string };
    accounts?: { id: string; name: string; mask: string; type: string; subtype: string }[];
  }): Observable<RequestResponse> {
    return this.http.post<RequestResponse>(`${this.apiBaseUrl}/exchange-token`, request);
  }

  /** Get Plaid-specific details for a funding account */
  getFundingDetails(accountId: number): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/funding-details?accountId=${accountId}`);
  }

  /** Refresh balances for a Plaid item */
  refreshBalances(plaidItemId: number): Observable<RequestResponse> {
    return this.http.post<RequestResponse>(`${this.apiBaseUrl}/refresh-balances?plaidItemId=${plaidItemId}`, {});
  }

  /** Get recent transactions */
  getTransactions(plaidItemId: number, days = 30): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(
      `${this.apiBaseUrl}/transactions?plaidItemId=${plaidItemId}&days=${days}`
    );
  }

  /** Get ACH auth data */
  getAuth(plaidItemId: number): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/auth?plaidItemId=${plaidItemId}`);
  }

  /** Get identity info */
  getIdentity(plaidItemId: number): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/identity?plaidItemId=${plaidItemId}`);
  }

  /** Remove Plaid item (revoke access) */
  removeItem(plaidItemId: number): Observable<RequestResponse> {
    return this.http.delete<RequestResponse>(`${this.apiBaseUrl}/remove-item?plaidItemId=${plaidItemId}`);
  }
}

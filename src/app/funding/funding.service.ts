import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RequestResponse } from '../request-response';

export interface FundingSourceResponse {
  accountId: number;
  accountName: string;
  description: string;
  isActive: boolean;
  createdAt: string;
  connectionId: number;
  providerName: string;
  providerIconKey: string;
  providerColor: string;
  providerWebsite: string;
  baseUrl: string;
  hasCredentials: boolean;
  credentialLabel: string;
  maskedApiKey: string;
  credentialLastUsedAt: string | null;
}

export interface FundingProviderEntry {
  connectionId: number;
  name: string;
  description: string;
  iconKey: string;
  color: string;
  website: string;
  defaultBaseUrl: string;
  requiredFields: string[];
  signupUrl: string;
  apiDocsUrl: string;
}

export interface CreateFundingSourceRequest {
  connectionId: number;
  name: string;
  description?: string;
  baseUrl?: string;
  credentials?: {
    apiKey?: string;
    apiSecret?: string;
    passphrase?: string;
    username?: string;
    password?: string;
    label?: string;
  };
}

@Injectable({
  providedIn: 'root',
})
export class FundingService {
  private apiBaseUrl = 'https://localhost:7182/Funding';

  constructor(private http: HttpClient) {}

  /** Get the user's primary funding source */
  getPrimary(): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/get-primary`);
  }

  /** Get available funding providers */
  getProviders(): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/get-providers`);
  }

  /** Create or update the primary funding source */
  setPrimary(request: CreateFundingSourceRequest): Observable<RequestResponse> {
    return this.http.post<RequestResponse>(`${this.apiBaseUrl}/set-primary`, request);
  }

  /** Remove the primary funding flag */
  removePrimary(): Observable<RequestResponse> {
    return this.http.delete<RequestResponse>(`${this.apiBaseUrl}/remove-primary`);
  }
}

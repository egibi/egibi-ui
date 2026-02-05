import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RequestResponse } from '../request-response';
import { Account, CreateAccountRequest } from '../_models/account.model';
import { AccountDetails } from '../_models/account-details.model';
import {
  UpdateAccountRequest,
  UpdateCredentialsRequest,
  UpdateAccountFeesRequest,
} from '../_models/account-detail.model';

@Injectable({
  providedIn: 'root',
})
export class AccountsService {
  private apiBaseUrl: string = 'https://localhost:7182/Accounts';

  constructor(private http: HttpClient) {}

  // =============================================
  // ACCOUNT DETAIL (for detail page)
  // =============================================

  /** Returns full account detail with connection, credentials summary, and fees */
  public getAccountDetail(id: number): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/get-account-detail?id=${id}`);
  }

  /** Update general account properties */
  public updateAccount(request: UpdateAccountRequest): Observable<RequestResponse> {
    return this.http.put<RequestResponse>(`${this.apiBaseUrl}/update-account`, request);
  }

  /** Update encrypted credentials (only non-null fields are re-encrypted) */
  public updateCredentials(request: UpdateCredentialsRequest): Observable<RequestResponse> {
    return this.http.put<RequestResponse>(`${this.apiBaseUrl}/update-credentials`, request);
  }

  /** Update fee structure for an account */
  public updateFees(request: UpdateAccountFeesRequest): Observable<RequestResponse> {
    return this.http.put<RequestResponse>(`${this.apiBaseUrl}/update-fees`, request);
  }

  /** Test connectivity to the account's exchange API */
  public testConnection(accountId: number): Observable<RequestResponse> {
    return this.http.post<RequestResponse>(`${this.apiBaseUrl}/test-connection?accountId=${accountId}`, {});
  }

  // =============================================
  // EXISTING ENDPOINTS
  // =============================================

  public getAccounts(): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/get-accounts`);
  }

  public getAccount(id: number): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/get-account` + '?id=' + id);
  }

  public getAccountTypes(): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/get-account-types`);
  }

  public saveAccount(account: Account): Observable<RequestResponse> {
    return this.http.post<RequestResponse>(`${this.apiBaseUrl}/save-account`, account);
  }

  /**
   * Create a new account with optional encrypted credentials.
   * This is the primary endpoint for the new card-based creation flow.
   */
  public createAccount(request: CreateAccountRequest): Observable<RequestResponse> {
    return this.http.post<RequestResponse>(`${this.apiBaseUrl}/create-account`, request);
  }

  public deleteAccount(account: Account): Observable<RequestResponse> {
    return this.http.delete<RequestResponse>(`${this.apiBaseUrl}/delete-account` + '?id=' + account.id);
  }

  // CRUD ACTIONS FOR ACCOUNT DETAILS
  public saveAccountDetails(accountDetails: AccountDetails): Observable<RequestResponse> {
    return this.http.post<RequestResponse>(`${this.apiBaseUrl}/save-account-details`, accountDetails);
  }
}

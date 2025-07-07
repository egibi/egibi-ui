import { Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { RequestResponse } from "../request-response";
import { Account } from "../_models/account.model";

@Injectable({
  providedIn: "root",
})
export class AccountsService {
  private apiBaseUrl: string = "https://localhost:7182/Accounts";

  constructor(private http: HttpClient) {}

  public getAccounts(): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/get-accounts`);
  }

  public getAccount(id:number):Observable<RequestResponse>{
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/get-account` + "?id=" + id);
  }

  public getAccountTypes():Observable<RequestResponse>{
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/get-account-types`);
  }

  public saveAccount(account:Account):Observable<RequestResponse>{
    return this.http.post<RequestResponse>(`${this.apiBaseUrl}/save-account`, account);
  }
  
  public deleteAccount(account: Account): Observable<RequestResponse> {
    return this.http.delete<RequestResponse>(`${this.apiBaseUrl}/delete-account` + "?id=" + account.id);
  }
}

import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { RequestResponse } from "../request-response";
import { Observable } from "rxjs";
import { Market } from "../_models/market.model";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class MarketsService {
  private apiBaseUrl: string = `${environment.apiUrl}/Markets`;

  constructor(private http: HttpClient) {}

  public getMarkets(): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/get-markets`);
  }

  public getMarket(id: number): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/get-market` + "?id=" + id);
  }

  public saveMarket(market: Market): Observable<RequestResponse> {
    return this.http.post<RequestResponse>(`${this.apiBaseUrl}/save-market`, market);
  }

  public deleteMarket(market: Market): Observable<RequestResponse> {
    return this.http.delete<RequestResponse>(`${this.apiBaseUrl}/delete-market` + "?id=" + market.id);
  }
}

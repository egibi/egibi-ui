import { HttpClient } from "@angular/common/http";
import { Injectable } from "@angular/core";
import { RequestResponse } from "../request-response";
import { Observable } from "rxjs";
import { Exchange } from "../_models/exchange.model";

@Injectable({
  providedIn: "root",
})
export class ExchangesService {
  private apiBaseUrl: string = "https://localhost:7182/Exchanges";

  constructor(private http: HttpClient) {}

  public getExchanges(): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/get-exchanges`);
  }

  public getExchange(id: number): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/get-exchange` + "?id=" + id);
  }

  public saveExchange(exchange: Exchange): Observable<RequestResponse> {
    return this.http.post<RequestResponse>(`${this.apiBaseUrl}/save-exchange`, exchange);
  }

  public deleteExchange(exchange: Exchange): Observable<RequestResponse> {
    return this.http.delete<RequestResponse>(`${this.apiBaseUrl}/delete-exchange` + "?id=" + exchange.id);
  }
}

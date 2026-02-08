import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { Backtest } from "./backtester.models";
import { RequestResponse } from "../_models/request-response.model";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class BacktesterService {
  private readonly apiBaseUrl = `${environment.apiUrl}/Backtester`;
  private currentBacktestsGridAction: string = "";

  constructor(private http: HttpClient) {}

  public getBacktests(): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/get-backtests`);
  }

  public getBacktest(id: number): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/get-backtest/${id}`);
  }

  public createBacktest(backtest: Backtest): Observable<RequestResponse> {
    return this.http.post<RequestResponse>(`${this.apiBaseUrl}/create-backtest`, backtest);
  }

  public updateBacktest(backtest: Backtest): Observable<RequestResponse> {
    return this.http.put<RequestResponse>(`${this.apiBaseUrl}/update-backtest`, backtest);
  }

  public deleteBacktest(id: number): Observable<RequestResponse> {
    return this.http.delete<RequestResponse>(`${this.apiBaseUrl}/delete-backtest/${id}`);
  }

  public getCurrentBacktestsGridAction(): string {
    return this.currentBacktestsGridAction;
  }

  public setCurrentBacktestsGridAction(action: string): void {
    this.currentBacktestsGridAction = action;
  }
}

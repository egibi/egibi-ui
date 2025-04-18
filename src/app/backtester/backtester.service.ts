import { Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { RequestResponse } from "../request-response";
import { SelectOption } from "../_models/select-option.model";
import { Backtest } from "./backtester.models";
@Injectable({
  providedIn: "root",
})
export class BacktesterService {
  private apiBaseUrl: string = "https://localhost:7182/Backtester";

  public selectedBacktestComponent = signal<Backtest>(new Backtest());

  constructor(private http: HttpClient) {}

  public getDataSources(): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/get-data-sources`);
  }

  public getBacktests():Observable<RequestResponse>{
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/get-backtests`);
  } 

  public getSelectedBacktest(): Backtest {
    return this.selectedBacktestComponent();
  }

  public setSelectedBacktest(backtest: Backtest): void {
    this.selectedBacktestComponent.update(() => backtest);
  }

  public saveBacktest(backtest:Backtest):Observable<RequestResponse>{
    return this.http.post<RequestResponse>(`${this.apiBaseUrl}/save-backtest`, backtest)
  }

  public deleteBacktest(backtest:Backtest):Observable<RequestResponse>{
    return this.http.delete<RequestResponse>(`${this.apiBaseUrl}/delete-backtest` + "?id=" + backtest.backtestID);
  }
}

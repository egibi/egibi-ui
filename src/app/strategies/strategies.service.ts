import { Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { RequestResponse } from "../request-response";
import { Strategy } from "../_models/strategy.model";

@Injectable({
  providedIn: "root",
})
export class StrategiesService {
  private apiBaseUrl: string = "https://localhost:7182/Strategies";

  public selectedStrategyComponent = signal<Strategy>(new Strategy());
  
  constructor(private http: HttpClient) {}

  public getSelectedStrategy(): Strategy {
    return this.selectedStrategyComponent();
  }

  public setSelectedStrategy(strategy: Strategy): void {
    this.selectedStrategyComponent.update(() => strategy);
  }

  public getStrategies(): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/get-strategies`);
  }

  public getStrategy(id: number): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/get-strategy` + "?id=" + id);
  }

  public saveStrategy(strategy:Strategy):Observable<RequestResponse>{    
    return this.http.post<RequestResponse>(`${this.apiBaseUrl}/save-strategy`, strategy);
  }

  public deleteStrategy(strategy:Strategy):Observable<RequestResponse>{
    return this.http.delete<RequestResponse>(`${this.apiBaseUrl}/delete-strategy` + "?id=" + strategy.id);
  }
}

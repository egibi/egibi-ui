// FILE: egibi-ui/src/app/_services/strategies.service.ts

import { Injectable } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { firstValueFrom } from "rxjs";
import { Strategy, CreateStrategyRequest, BacktestRequest, BacktestResult, BacktestSummary, DataCoverage, DataVerificationRequest } from "../_models/strategy.model";
import { environment } from "../../environments/environment";

@Injectable({ providedIn: "root" })
export class StrategiesService {
  private apiBaseUrl = `${environment.apiUrl}/api/strategies`;

  constructor(private http: HttpClient) {}

  // ── Strategy CRUD ────────────────────────────────────────

  async getAll(): Promise<any> {
    return firstValueFrom(this.http.get<any>(this.apiBaseUrl));
  }

  async getById(id: number): Promise<any> {
    return firstValueFrom(this.http.get<any>(`${this.apiBaseUrl}/${id}`));
  }

  async create(request: CreateStrategyRequest): Promise<any> {
    return firstValueFrom(this.http.post<any>(this.apiBaseUrl, request));
  }

  async update(id: number, request: CreateStrategyRequest): Promise<any> {
    return firstValueFrom(this.http.put<any>(`${this.apiBaseUrl}/${id}`, request));
  }

  async delete(id: number): Promise<any> {
    return firstValueFrom(this.http.delete<any>(`${this.apiBaseUrl}/${id}`));
  }

  // ── Backtesting ──────────────────────────────────────────

  async runBacktest(strategyId: number, request: BacktestRequest): Promise<any> {
    return firstValueFrom(this.http.post<any>(`${this.apiBaseUrl}/${strategyId}/backtest`, request));
  }

  async getBacktests(strategyId: number): Promise<any> {
    return firstValueFrom(this.http.get<any>(`${this.apiBaseUrl}/${strategyId}/backtests`));
  }

  async getBacktestDetail(backtestId: number): Promise<any> {
    return firstValueFrom(this.http.get<any>(`${this.apiBaseUrl}/backtests/${backtestId}`));
  }

  // ── Data Verification & Coverage ──────────────────────────

  async verifyData(request: DataVerificationRequest): Promise<any> {
    return firstValueFrom(this.http.post<any>(`${this.apiBaseUrl}/verify-data`, request));
  }

  async getDataCoverage(symbol?: string): Promise<any> {
    const params = symbol ? `?symbol=${encodeURIComponent(symbol)}` : "";
    return firstValueFrom(this.http.get<any>(`${this.apiBaseUrl}/data-coverage${params}`));
  }

  async getAvailableSymbols(): Promise<any> {
    return firstValueFrom(this.http.get<any>(`${this.apiBaseUrl}/available-symbols`));
  }
}

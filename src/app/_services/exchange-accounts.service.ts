// FILE: egibi-ui/src/app/_services/exchange-accounts.service.ts

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ExchangeAccountsService {
  private apiBaseUrl = 'https://localhost:7182/ExchangeAccounts';

  constructor(private http: HttpClient) {}

  async getAll(): Promise<any> {
    return firstValueFrom(
      this.http.get<any>(`${this.apiBaseUrl}/get-exchange-accounts`)
    );
  }

  async getById(id: number): Promise<any> {
    return firstValueFrom(
      this.http.get<any>(`${this.apiBaseUrl}/get-exchange-account?id=${id}`)
    );
  }
}

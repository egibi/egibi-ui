import { Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { RequestResponse } from "../request-response";

@Injectable({
  providedIn: 'root'
})
export class BacktesterService {
  private apiBaseUrl: string = "https://localhost:7182/Backtester";

  constructor() { }
}

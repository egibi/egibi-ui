import { Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { RequestResponse } from "../request-response";

@Injectable({
  providedIn: "root",
})
export class ApiTesterService {
  private apiBaseUrl: string = "https://localhost:7182/ApiTester";

  constructor(private http: HttpClient) {}

  public testConnection(): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/test-connection`);
  }

  public getServerTime(): Observable<RequestResponse>{
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/get-server-time`);
  }
}

import { Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { RequestResponse } from "../request-response";
import { environment } from "../../environments/environment";

@Injectable({
  providedIn: "root",
})
export class ApiTesterService {
  private apiBaseUrl: string = `${environment.apiUrl}ApiTester`;

  constructor(private http: HttpClient) {}

  public testConnection(): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/test-connection`);
  }

  public getServerTime(): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/get-server-time`);
  }
}

import { Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { RequestResponse } from "../request-response";

@Injectable({
  providedIn: "root",
})
export class TestingService {
  private apiBaseUrl: string = "https://localhost:7182/Testing";

  constructor(private http: HttpClient) {}

  public testGeoDateTimeData(): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/run-geo-date-time-data-test`);
  }
}

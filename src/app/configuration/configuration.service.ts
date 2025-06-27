import { Injectable, signal } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";
import { RequestResponse } from "../request-response";

@Injectable({
  providedIn: "root",
})
export class ConfigurationService {
  private apiBaseUrl: string = "https://localhost:7182/Configuration";

  entityTypes: string[] = [];

  constructor(private http: HttpClient) {}

  public getEntityTypeTables(): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/get-entity-type-tables`);
  }

  public getEntityTypeRecords(tableName: string):Observable<RequestResponse>{
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/get-entity-type-records?tableName=${tableName}`);
  }


}

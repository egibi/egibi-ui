import { Injectable } from "@angular/core";
import { Observable } from "rxjs";
import { HttpClient } from "@angular/common/http";
import { RequestResponse } from "../request-response";
import { Connection } from "../models/connection.model";


@Injectable({
  providedIn: "root",
})
export class ConnectionsService {

  private apiBaseUrl: string = "https://localhost:7182/Connections";

  constructor(private http: HttpClient) {}

  public getConnections(): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/get-connections`);
  }

  public getConnection(id: number): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/get-connection` + "?id=" + id);
  }

  public saveConnection(connection: Connection): Observable<RequestResponse> {
    return this.http.post<RequestResponse>(`${this.apiBaseUrl}/save-connection`, connection);
  }

  public deleteConnection(id: number): Observable<RequestResponse> {
    return this.http.delete<RequestResponse>(`${this.apiBaseUrl}/get-connection` + "?id=" + id);
  }
}

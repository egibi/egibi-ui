import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { RequestResponse } from '../request-response';
import { Connection } from '../_models/connection.model';

@Injectable({
  providedIn: 'root',
})
export class ConnectionsService {
  private apiBaseUrl = 'https://localhost:7182/Connections';

  constructor(private http: HttpClient) {}

  /** Get all connections (service catalog) */
  getConnections(): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/get-connections`);
  }

  /** Get a single connection by ID */
  getConnection(id: number): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/get-connection?connectionId=${id}`);
  }

  /** Get connection types (api, unknown, etc.) */
  getConnectionTypes(): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/get-connection-types`);
  }

  /** Create or update a connection (service catalog entry) */
  saveConnection(connection: Connection): Observable<RequestResponse> {
    return this.http.post<RequestResponse>(`${this.apiBaseUrl}/save-connection`, connection);
  }

  /** Delete a single connection */
  deleteConnection(id: number): Observable<RequestResponse> {
    return this.http.delete<RequestResponse>(`${this.apiBaseUrl}/delete-connection?id=${id}`);
  }

  /** Get only active connections for the account card picker */
  getActiveServices(): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiBaseUrl}/get-connections`);
  }
}

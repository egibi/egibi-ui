import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RequestResponse } from '../../request-response';
import { environment } from '../../../environments/environment';

export interface AccessRequestSummary {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  status: string;
  ipAddress: string | null;
  denialReason: string | null;
  createdAt: string;
  emailVerifiedAt: string | null;
  reviewedByUserId: number | null;
  reviewedAt: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class AccessRequestsService {
  private apiUrl = `${environment.apiUrl}/AccessRequest`;

  constructor(private http: HttpClient) {}

  getPendingRequests(): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiUrl}/pending`);
  }

  getAllRequests(): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiUrl}/all`);
  }

  approveRequest(id: number): Observable<RequestResponse> {
    return this.http.post<RequestResponse>(`${this.apiUrl}/${id}/approve`, {});
  }

  denyRequest(id: number, reason?: string): Observable<RequestResponse> {
    return this.http.post<RequestResponse>(`${this.apiUrl}/${id}/deny`, { reason });
  }

  deleteRequest(id: number): Observable<RequestResponse> {
    return this.http.delete<RequestResponse>(`${this.apiUrl}/${id}`);
  }
}

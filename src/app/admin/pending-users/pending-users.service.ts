import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface AccessRequestDto {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  message: string;
  status: string;
  requestedAt: string;
  reviewedAt: string | null;
  reviewedBy: string | null;
  rejectionReason: string | null;
}

@Injectable({ providedIn: 'root' })
export class PendingUsersService {
  private apiUrl = `${environment.apiUrl}/AccessRequests`;

  constructor(private http: HttpClient) {}

  getAccessRequests(status?: string): Observable<any> {
    const params = status ? `?status=${status}` : '';
    return this.http.get<any>(`${this.apiUrl}/get-access-requests${params}`);
  }

  approveRequest(requestId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/approve`, { requestId });
  }

  rejectRequest(requestId: number, reason: string): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/reject`, { requestId, reason });
  }

  deleteRequest(requestId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/delete?requestId=${requestId}`);
  }
}

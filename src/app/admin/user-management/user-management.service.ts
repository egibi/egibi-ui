import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { RequestResponse } from '../../request-response';
import { environment } from '../../../environments/environment';

export interface UserSummary {
  id: number;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: string;
  isActive: boolean;
  createdAt: string;
  lastModifiedAt: string | null;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  role?: string;
}

export interface UpdateUserRequest {
  firstName?: string;
  lastName?: string;
  role?: string;
}

@Injectable({
  providedIn: 'root'
})
export class UserManagementService {
  private apiUrl = `${environment.apiUrl}/UserManagement`;

  constructor(private http: HttpClient) {}

  getUsers(): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiUrl}/users`);
  }

  getUser(id: number): Observable<RequestResponse> {
    return this.http.get<RequestResponse>(`${this.apiUrl}/users/${id}`);
  }

  createUser(request: CreateUserRequest): Observable<RequestResponse> {
    return this.http.post<RequestResponse>(`${this.apiUrl}/users`, request);
  }

  updateUser(id: number, request: UpdateUserRequest): Observable<RequestResponse> {
    return this.http.put<RequestResponse>(`${this.apiUrl}/users/${id}`, request);
  }

  deactivateUser(id: number): Observable<RequestResponse> {
    return this.http.post<RequestResponse>(`${this.apiUrl}/users/${id}/deactivate`, {});
  }

  reactivateUser(id: number): Observable<RequestResponse> {
    return this.http.post<RequestResponse>(`${this.apiUrl}/users/${id}/reactivate`, {});
  }

  resetPassword(id: number, newPassword: string): Observable<RequestResponse> {
    return this.http.post<RequestResponse>(`${this.apiUrl}/users/${id}/reset-password`, { newPassword });
  }
}
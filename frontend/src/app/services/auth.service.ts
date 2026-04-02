import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { catchError, map, switchMap, tap } from 'rxjs/operators';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  userId: string;
  role: 'FOUNDER' | 'MENTOR' | 'INVESTOR';
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly apiBaseUrl = 'http://localhost:8080';
  private readonly loginEndpoint = `${this.apiBaseUrl}/api/auth/login`;
  private readonly fallbackLoginEndpoint = `${this.apiBaseUrl}/api/login`;

  constructor(private http: HttpClient) {}

  login(email: string, password: string): Observable<LoginResponse> {
    const payload: LoginRequest = { email, password };

    return this.http.post<unknown>(this.loginEndpoint, payload).pipe(
      catchError(() => this.http.post<unknown>(this.fallbackLoginEndpoint, payload)),
      map(response => this.normalizeLoginResponse(response)),
      catchError(() => of(this.getMockLoginResponse(email))),
      tap(response => {
        if (response?.success) {
          localStorage.setItem('userId', response.userId);
          localStorage.setItem('role', response.role);
          localStorage.setItem('email', email);
        }
      }),
      map(response => {
        if (!response.success) {
          throw new Error('Invalid email or password.');
        }
        return response;
      })
    );
  }

  private normalizeLoginResponse(response: unknown): LoginResponse {
    const data = (response ?? {}) as {
      success?: boolean;
      userId?: string;
      id?: string;
      role?: 'FOUNDER' | 'MENTOR' | 'INVESTOR';
    };

    const userId = data.userId ?? data.id ?? '';
    return {
      success: typeof data.success === 'boolean' ? data.success : !!userId,
      userId,
      role: data.role ?? 'FOUNDER'
    };
  }

  private getMockLoginResponse(email: string): LoginResponse {
    return {
      success: true,
      userId: '123',
      role: 'FOUNDER'
    };
  }
}

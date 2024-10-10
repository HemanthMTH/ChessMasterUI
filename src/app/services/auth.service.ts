import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Login } from '../models/login';
import { Register } from '../models/register';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private isAuthenticatedSubject = new BehaviorSubject<boolean>(this.isAuthenticated());  // Initialize with current auth state

  constructor(private http: HttpClient) {}

  // Expose the isAuthenticated$ observable so components can subscribe to real-time authentication state
  get isAuthenticated$(): Observable<boolean> {
    return this.isAuthenticatedSubject.asObservable();
  }

  login(credentials: Login): Observable<any> {
    return this.http.post(`${this.apiUrl}/login`, credentials);
  }

  register(user: Register): Observable<any> {
    return this.http.post(`${this.apiUrl}/register`, user);
  }

  saveToken(token: string) {
    localStorage.setItem('token', token);
    this.isAuthenticatedSubject.next(true);  // Notify subscribers that the user is now authenticated
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  logout() {
    localStorage.removeItem('token');
    this.isAuthenticatedSubject.next(false);  // Notify subscribers that the user is now logged out
  }

  isAuthenticated(): boolean {
    return !!this.getToken();
  }
}

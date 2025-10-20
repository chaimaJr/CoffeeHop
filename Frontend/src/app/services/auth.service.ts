// src/app/services/auth.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from 'src/environments/environment';
import { User } from '../models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  currentUser = signal<any>(null);
  token = signal<string | null>(null);

  constructor(private http: HttpClient) {
    this.getToken();
  }

  getToken() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      this.token.set(token);
      this.currentUser.set(JSON.parse(user));
    }
  }

  // In auth.service.ts

  login(username: string, password: string) {
    return this.http.post(`${environment.apiUrl}/login/`, { username, password })
      .pipe(tap((res: any) => {
        
        if (res.user && res.user.role) {
          res.user.role = res.user.role;
        }

        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.token.set(res.token);
        this.currentUser.set(res.user);
      }));
  }

  register(data: any) {
    return this.http.post(`${environment.apiUrl}/register/`, data)
      .pipe(tap((res: any) => {

        if (res.user && res.user.role) {
          res.user.role = res.user.role;
        }

        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.token.set(res.token);
        this.currentUser.set(res.user);
      }));
  }

   /**
   * Update user data in memory and localStorage
   */
  updateUserData(updatedUser: Partial<User>): void {
    const current = this.currentUser();
    if (current) {
      const merged = { ...current, ...updatedUser };
      this.currentUser.set(merged);
      localStorage.setItem('user', JSON.stringify(merged));
      console.log('✅ User data updated in AuthService');
    }
  }

  /**
   * Refresh user data from API
   */
  refreshUserData(): Observable<User> {
    return this.http.get<User>(`${environment.apiUrl}/profile/`).pipe(
      tap(user => {
        this.currentUser.set(user);
        localStorage.setItem('user', JSON.stringify(user));
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.token.set(null);
    this.currentUser.set(null);
  }

  isAuthenticated() {
    return this.token() !== null;
  }

  getUser(){
    return this.currentUser;
  }
}
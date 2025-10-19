// src/app/services/auth.service.ts
import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs';
import { environment } from 'src/environments/environment';

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

  login(username: string, password: string) {
    return this.http.post(`${environment.apiUrl}/login/`, { username, password })
      .pipe(tap((res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.token.set(res.token);
        this.currentUser.set(res.user);
      }));
  }

  register(data: any) {
    return this.http.post(`${environment.apiUrl}/register/`, data)
      .pipe(tap((res: any) => {
        localStorage.setItem('token', res.token);
        localStorage.setItem('user', JSON.stringify(res.user));
        this.token.set(res.token);
        this.currentUser.set(res.user);
      }));
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
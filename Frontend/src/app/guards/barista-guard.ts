import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { inject } from '@angular/core';

// Optional: Separate guard for barista-only routes
export const baristaGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  let user = null;
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
    }
  }

  if (!token || !user) {
    if (state.url !== '/login') {
      router.navigate(['/login']);
    }
    return false;
  }

  // Check if user is barista or admin
  if (user.role !== 'BARISTA' && user.role !== 'ADMIN') {
    console.warn(`Barista access denied. User role: ${user.role}`);
    router.navigate(['/tabs/home']);
    return false;
  }

  return true;
};
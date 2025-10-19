// ============================================================================
// src/app/core/guards/auth.guard.ts (FIXED)
// ============================================================================
import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  // Read fresh token from localStorage (in case signal hasn't updated yet)
  const token = localStorage.getItem('token');
  const isAuth = !!token;

  console.log('Guard Check:', {
    token: token ? 'EXISTS' : 'MISSING',
    isAuth: isAuth,
    url: state.url
  });

  if (isAuth) {
    console.log('✅ Guard PASSED');
    return true;
  }

  console.log('❌ Guard BLOCKED - redirecting to /login');
  router.navigate(['/login']);
  return false;
};

import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = localStorage.getItem('token');
  const isAuth = !!token;

  console.log('Guard Check:', {
    token: token ? 'EXISTS' : 'MISSING',
    isAuth: isAuth,
    url: state.url
  });

  if (isAuth) {
    return true;
  }

  router.navigate(['/login']);
  return false;
};
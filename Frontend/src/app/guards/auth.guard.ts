import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  // Parse user directly from localStorage to avoid timing issues
  let user = null;
  if (userStr) {
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      console.error('Failed to parse user from localStorage', e);
    }
  }

  console.log('🛡️ AUTH GUARD Check:', {
    token: token ? 'EXISTS' : 'MISSING',
    user: user,
    userRole: user?.role,
    url: state.url,
    requiredRoles: route.data?.['roles'],
    routePath: route.routeConfig?.path
  });

  // Not authenticated at all
  if (!token || !user) {
    // Only redirect if not already on login page
    if (state.url !== '/login') {
      router.navigate(['/login']);
    }
    return false;
  }

  // Check role-based access if roles are specified in route data
  const requiredRoles = route.data?.['roles'] as string[] | undefined;
  
  if (requiredRoles && requiredRoles.length > 0) {
    const hasRequiredRole = requiredRoles.includes(user.role);
    
    if (!hasRequiredRole) {
      console.warn(`Access denied. User role: ${user.role}, Required: ${requiredRoles.join(', ')}`);
      
      // Redirect based on user's actual role
      if (user.role === 'barista' || user.role === 'admin') {
        router.navigate(['/barista']);
      } else {
        router.navigate(['/tabs/home']);
      }
      return false;
    }
  }

  return true;
};


// ============================================================================
// src/app/app.routes.ts (FIXED)
// ============================================================================
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },

  // ===== AUTH ROUTES (No Guard) =====
  {
    path: 'login',
    loadComponent: () =>
      import('./auth/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    loadComponent: () =>
      import('./auth/register/register.page').then((m) => m.RegisterPage),
  },

  // ===== CUSTOMER ROUTES (With Guard) =====
  {
    path: 'tabs',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./customer/tabs/tabs.page').then((m) => m.TabsPage),
    children: [
      // Default route - redirect /tabs to /tabs/home
      {
        path: '',
        redirectTo: 'home',
        pathMatch: 'full',
      },
      {
        path: 'home',
        loadComponent: () =>
          import('./customer/home/home.page').then((m) => m.HomePage),
      },
      {
        path: 'order',
        loadComponent: () =>
          import('./customer/order/order.page').then((m) => m.OrderPage),
      },
      {
        path: 'profile',
        loadComponent: () =>
          import('./customer/profile/profile.page').then(
            (m) => m.ProfilePage
          ),
      },
    ],
  },

  // ===== CHECKOUT ROUTE =====
  {
    path: 'checkout',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./customer/checkout/checkout.page').then(
        (m) => m.CheckoutPage
      ),
  },

  // ===== BARISTA ROUTES =====
  {
    path: 'barista',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./barista/queue/queue.page').then((m) => m.QueuePage),
  },

  // ===== CATCH-ALL (must be last) =====
  {
    path: '**',
    redirectTo: '/login',
  },
];
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth.guard';
import { baristaGuard } from './guards/barista-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/login',
    pathMatch: 'full',
  },

  // ===== AUTH ROUTES =====
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

  // ===== CUSTOMER ROUTES =====
  {
    path: 'tabs',
    canActivate: [authGuard],
    data: { roles: ['CUSTOMER'] },
    loadComponent: () =>
      import('./customer/tabs/tabs.page').then((m) => m.TabsPage),
    children: [
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
          import('./customer/profile/profile.page').then((m) => m.ProfilePage),
      },
    ],
  },
  {
    path: 'order-details/:id',
    canActivate: [authGuard],
    data: { roles: ['CUSTOMER'] },
    loadComponent: () => import('./customer/order-details/order-details.page').then( m => m.OrderDetailsPage)
  },


  // ===== BARISTA ROUTES =====
  {
    path: 'barista',
    canActivate: [baristaGuard],
    loadComponent: () => 
      import('./barista/barista-home/barista-home.page').then(m => m.BaristaHomePage)
  },


  // Other
  {
    path: '**',
    redirectTo: '/login',
  },

];
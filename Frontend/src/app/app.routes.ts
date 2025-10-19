// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './guards/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: 'login',
    pathMatch: 'full'
  },
  {
    path: 'login',
    loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage)
  },
  // {
  //   path: 'register',
  //   loadComponent: () => import('./pages/register/register.page').then(m => m.RegisterPage)
  // },
  {
    path: '',
    loadChildren: () => import('./tabs/tabs.routes').then(r => r.tabRoutes),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: 'login'
  }
];
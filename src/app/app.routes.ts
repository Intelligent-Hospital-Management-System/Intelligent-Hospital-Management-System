import { Routes } from '@angular/router';
import { authGuard } from './auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    loadComponent: () => import('./login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'main',
    canActivate: [authGuard],
    loadComponent: () => import('./main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    children: [
      {
        path: 'items',
        loadComponent: () => import('./items/items.component').then(m => m.ItemsComponent)
      },
      {
        path: 'config',
        loadComponent: () => import('./config/config.component').then(m => m.ConfigComponent)
      },
      { path: '', redirectTo: 'items', pathMatch: 'full' }
    ]
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' }
];

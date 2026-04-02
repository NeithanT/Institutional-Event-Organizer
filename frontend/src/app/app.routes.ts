import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/login-page/login-page').then(m => m.LoginPage)
  },
  {
    path: 'user',
    loadComponent: () => import('./pages/user-page/user-page').then(m => m.UserPage)
  },
  {
    path: 'events',
    loadComponent: () => import('./pages/events-page/events-page').then(m => m.EventsPage)
  },
  { path: 'inscripciones', loadComponent: () => import('./pages/inscriptions-page/inscriptions-page').then(m => m.InscriptionsPage) }

];


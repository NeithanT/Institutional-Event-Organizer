import { Routes } from '@angular/router';
import { AuthenticationGuard } from './guards/authentication.guard';
import { AuthenticationState } from './services/authentication';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () => import('./pages/login-page/login-page').then(m => m.LoginPage)
  },
  {
    path: 'user',
    loadComponent: () => import('./pages/user-page/user-page').then(m => m.UserPage),
    canActivate: [AuthenticationGuard]
  },
  {
    path: 'create-event',
    loadComponent: () => import('./pages/organizer-page/create-event/create-event').then(m => m.CreateEvent),
    canActivate: [AuthenticationGuard],
    data: {
      allowedRoles: [AuthenticationState.Admin, AuthenticationState.Organizer]
    }
  },
  {
     path: 'events',
    loadComponent: () => import('./pages/events-page/events-page').then(m => m.EventsPage),
    canActivate: [AuthenticationGuard]
  },
  {
    path: 'inscripciones',
    loadComponent: () => import('./pages/inscriptions-page/inscriptions-page').then(m => m.InscriptionsPage),
    canActivate: [AuthenticationGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./pages/user-profile-page/user-profile-page').then(m => m.UserProfilePage),
    canActivate: [AuthenticationGuard]
  },
  {
    path: 'events/:id',
    loadComponent: () => import('./pages/event-detail-page/event-detail-page').then(m => m.EventDetailPage),
    canActivate: [AuthenticationGuard]
  },
  {
    path: 'announcements',
    loadComponent: () => import('./pages/announcements-page/announcements-page').then(m => m.AnnouncementsPage),
    canActivate: [AuthenticationGuard]
  },
  {
    path: 'announcements/:id',
    loadComponent: () => import('./pages/announcement-detail-page/announcement-detail-page').then(m => m.AnnouncementDetailPage),
    canActivate: [AuthenticationGuard]
  },
  {
    path: 'admin',
    loadComponent: () => import('./pages/admin-page/admin-page').then(m => m.AdminPage),
    canActivate: [AuthenticationGuard],
    data: {
      allowedRoles: [AuthenticationState.Admin]
    }
  },
];


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
  path: 'organizer-events',
  loadComponent: () => import('./pages/organizer-page/organizer-dashboard/organizer-dashboard').then(m => m.OrganizerDashboard),
  canActivate: [AuthenticationGuard]
},
{
  path: 'detail-event/:id',
  loadComponent: () => import('./pages/organizer-page/event-detail/event-detail').then(m => m.EventDetail),
  canActivate: [AuthenticationGuard]
},
{
  path: 'edit-event/:id',
  loadComponent: () => import('./pages/organizer-page/edit-event/edit-event').then(m => m.EditEvent),
  canActivate: [AuthenticationGuard]
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
    },
    children: [
      {
        path: '',
        pathMatch: 'full',
        redirectTo: 'event-approval'
      },
      {
        path: 'event-approval',
        loadComponent: () => import('./pages/admin-page/event-approval-admin/event-approval-admin').then(m => m.EventApprovalAdmin)
      },
      {
        path: 'report-generation',
        loadComponent: () => import('./pages/admin-page/report-generation-admin/report-generation-admin').then(m => m.ReportGenerationAdmin)
      },
      {
        path: 'announcement-system',
        loadComponent: () => import('./pages/admin-page/announcement-system-admin/announcement-system-admin').then(m => m.AnnouncementSystemAdmin)
      },
      {
        path: 'organizer-management',
        loadComponent: () => import('./pages/admin-page/organizer-management-admin/organizer-management-admin').then(m => m.OrganizerManagementAdmin)
      },
      {
        path: 'content-moderation',
        loadComponent: () => import('./pages/admin-page/content-moderation-admin/content-moderation-admin').then(m => m.ContentModerationAdmin)
      }
    ]
  },
];


import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../../components/sidebar/sidebar';
@Component({
  selector: 'app-admin-page',
  standalone: true,
  imports: [Sidebar, RouterOutlet],
  templateUrl: './admin-page.html',
  styleUrl: './admin-page.css',
})
export class AdminPage {

  sidebarLinks = [
    { label: 'Aprobacion de eventos', route: '/admin/event-approval' },
    { label: 'Generacion de reportes', route: '/admin/report-generation' },
    { label: 'Sistema de anuncios', route: '/admin/announcement-system' },
    { label: 'Gestion de organizadores', route: '/admin/organizer-management' },
    { label: 'Moderacion de contenido', route: '/admin/content-moderation' }
  ];

}

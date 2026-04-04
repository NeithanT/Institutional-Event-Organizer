import { Component, signal, HostListener, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Authentication, AuthenticationState } from '../../services/authentication';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar {

  router: Router = inject(Router);
  authenticationService: Authentication = inject(Authentication);
  navbarLinks: { label: string; route: string }[] = [];

  constructor() {
    if (this.authenticationService.authenticatedState === AuthenticationState.None) {
      this.router.navigate(['']);
    }

    this.navbarLinks = [
      { label: 'Inicio', route: '/user' },
      { label: 'Eventos', route: '/events' },
      { label: 'Inscripciones', route: '/inscripciones' },
    ];

    if (this.authenticationService.authenticatedState === AuthenticationState.Admin) {
      console.log('User is admin, adding admin links to navbar');
      this.navbarLinks.push({ label: 'Crear Evento', route: '/create-event' });
      this.navbarLinks.push({ label: 'Administrar', route: '/admin' });
    } else if (this.authenticationService.authenticatedState === AuthenticationState.Organizer) {
      this.navbarLinks.push({ label: 'Crear Evento', route: '/create-event' });
    }

  }
  showNotifications = signal(false);

  // Mock — TODO: cargar desde backend GET /notifications
  notifications = [
    { id: 1, title: 'Cancelación del Evento Karaoke-Chan', date: '19 de febrero 2026', announcementId: 1 },
    { id: 2, title: 'Almuerzo Gratis en el B3!',           date: '19 de febrero 2026', announcementId: 2 },
    { id: 3, title: 'Hackathon TEC 2026',                  date: '01 de marzo 2026',   announcementId: 4 },
  ];

  toggleNotifications() {
    this.showNotifications.update(v => !v);
  }

  // Cierra el dropdown si se hace click fuera
  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.notif-wrapper')) {
      this.showNotifications.set(false);
    }
  }
}

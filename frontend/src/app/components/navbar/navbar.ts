import { Component, signal, HostListener, inject, OnInit } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Authentication, AuthenticationState } from '../../services/authentication';
import { AnnouncementService } from '../../services/announcement.service';

interface NotificationItem {
  id: number;
  title: string;
  date: string;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrl: './navbar.css'
})
export class Navbar implements OnInit {

  router: Router = inject(Router);
  authenticationService: Authentication = inject(Authentication);
  announcementService: AnnouncementService = inject(AnnouncementService);
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
  notifications = signal<NotificationItem[]>([]);

  ngOnInit() {
    this.announcementService.getAnnouncements().subscribe({
      next: dtos => {
        this.notifications.set(dtos.slice(0, 10).map(dto => ({
          id:    dto.id,
          title: dto.title,
          date:  dto.eventDate
            ? new Date(dto.eventDate).toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' })
            : '',
        })));
      }
    });
  }

  toggleNotifications() {
    this.showNotifications.update(v => !v);
  }

  dismiss(id: number) {
    this.notifications.update(list => list.filter(n => n.id !== id));
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.notif-wrapper')) {
      this.showNotifications.set(false);
    }
  }
}

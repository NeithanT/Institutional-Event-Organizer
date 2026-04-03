import { Component, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';

interface EventDetail {
  id: number;
  title: string;
  content: string;
  organizer: string;
  cupos: number;
  fecha: string;
  isPast: boolean;
  isInscribed: boolean;
}

@Component({
  selector: 'app-event-detail-page',
  standalone: true,
  imports: [Navbar, Footer, RouterLink],
  templateUrl: './event-detail-page.html',
  styleUrl: './event-detail-page.css'
})
export class EventDetailPage implements OnInit {

  showSuccessModal = signal(false);
  event = signal<EventDetail | null>(null);

  // Mock data — TODO: reemplazar con GET /events/:id
  private mockEvents: EventDetail[] = [
    {
      id: 1,
      title: 'Karaoke-Chan',
      content: 'NUEVO EVENTO!!! Karaoke-Chan\n\nUnete a nuestro nuevo evento de Café en el B3 el día 07 de Mayo. Tendremos:\n\n• Karaoke para nuestros invitados\n• Comida gratis para nuestros invitados\n\nNo te lo pierdas,',
      organizer: 'Organizador XXX',
      cupos: 3,
      fecha: '07 de mayo 2026',
      isPast: false,
      isInscribed: false
    },
    {
      id: 2,
      title: 'Coffee Station',
      content: 'NUEVO EVENTO!!! COFFEE-STATION\n\nUnete a nuestro nuevo evento de Café en el B3 el día 07 de Mayo. Tendremos:\n\n• Café gourmet para nuestros invitados\n• Comida gratis para nuestros invitados\n\nNo te lo pierdas,',
      organizer: 'Organizador XXX',
      cupos: 0,
      fecha: '07 de mayo 2026',
      isPast: true,
      isInscribed: false
    },
    {
      id: 3,
      title: 'Swimming Pool',
      content: 'Evento de natación en las instalaciones del TEC.\n\n• Acceso a la piscina olímpica\n• Instructor disponible\n• Refrescos incluidos\n\nCupos limitados, ¡inscribite ya!',
      organizer: 'Deportes TEC',
      cupos: 10,
      fecha: '10 de mayo 2026',
      isPast: false,
      isInscribed: false
    }
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const found = this.mockEvents.find(e => e.id === id) ?? this.mockEvents[0];
    this.event.set(found);
  }

  inscribir() {
    // TODO: llamar al backend POST /inscriptions { eventId }
    this.event.update(e => e ? { ...e, cupos: e.cupos - 1, isInscribed: true } : e);
    this.showSuccessModal.set(true);
  }

  closeModal() {
    this.showSuccessModal.set(false);
  }

  getLines(content: string): string[] {
    return content.split('\n');
  }
}
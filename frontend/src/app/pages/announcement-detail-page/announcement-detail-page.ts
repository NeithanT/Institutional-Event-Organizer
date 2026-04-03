import { Component, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { Announcement } from '../announcements-page/announcements-page';

@Component({
  selector: 'app-announcement-detail-page',
  standalone: true,
  imports: [Navbar, Footer, RouterLink],
  templateUrl: './announcement-detail-page.html',
  styleUrl: './announcement-detail-page.css'
})
export class AnnouncementDetailPage implements OnInit {

  announcement = signal<Announcement | null>(null);

  // Mock data — TODO: reemplazar con GET /announcements/:id
  private mockData: Announcement[] = [
    { id: 1, title: 'Cancelación del Evento Karaoke-Chan', date: '19 de febrero 2026', content: 'Estimados estudiantes,\n\nSe les avisa que se cancela el evento Karaoke-Chan debido a problemas con las cafeteras brindadas por nuestro patrocinador.\n\nLes pedimos las disculpas del caso.', organizer: 'Organizador XXX' },
    { id: 2, title: 'Almuerzo Gratis en el B3!',           date: '19 de febrero 2026', content: 'Estimados estudiantes,\n\nSe les informa que el día de hoy habrá almuerzo gratis en el edificio B3 a partir de las 12:00 md.\n\nLos esperamos.', organizer: 'CASIE' },
    { id: 3, title: 'Evento Swimming Pool',                date: '19 de febrero 2026', content: 'Estimados estudiantes,\n\nSe les recuerda que el evento Swimming Pool se llevará a cabo este viernes en las instalaciones del TEC.\n\nCupos limitados.', organizer: 'Deportes TEC' },
    { id: 4, title: 'Hackathon TEC 2026',                  date: '01 de marzo 2026',   content: 'Estimados estudiantes,\n\nLes informamos que el Hackathon TEC 2026 está abierto para inscripciones. Equipos de 3 a 5 personas.\n\nFecha límite: 15 de marzo.', organizer: 'DATIC' },
    { id: 5, title: 'Cambio de sede Feria de Ciencias',    date: '05 de marzo 2026',   content: 'Estimados estudiantes,\n\nSe les comunica que la Feria de Ciencias cambia de sede al Gimnasio Principal.\n\nDisculpen los inconvenientes.', organizer: 'Vicerrectoría' },
    { id: 6, title: 'Apertura inscripciones BasketTeam',   date: '10 de marzo 2026',   content: 'Estimados estudiantes,\n\nYa están abiertas las inscripciones para el torneo de baloncesto interescuelas.\n\nFecha límite: 20 de marzo.', organizer: 'Deportes TEC' },
    { id: 7, title: 'Recordatorio: Torneo de Ajedrez',     date: '15 de marzo 2026',   content: 'Estimados estudiantes,\n\nSe les recuerda que el Torneo de Ajedrez inicia el próximo lunes. Presentarse 15 minutos antes.\n\nÉxitos.', organizer: 'CASIE' },
  ];

  constructor(private route: ActivatedRoute) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    const found = this.mockData.find(a => a.id === id) ?? this.mockData[0];
    this.announcement.set(found);
  }

  getLines(content: string): string[] {
    return content.split('\n');
  }
}
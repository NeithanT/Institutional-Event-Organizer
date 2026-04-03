import { Component, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';

export interface Announcement {
  id: number;
  title: string;
  date: string;
  content: string;
  organizer: string;
}

@Component({
  selector: 'app-announcements-page',
  standalone: true,
  imports: [Navbar, Footer, RouterLink],
  templateUrl: './announcements-page.html',
  styleUrl: './announcements-page.css'
})
export class AnnouncementsPage {

  currentPage = signal(1);
  itemsPerPage = 3;
  selectedDate = signal('');

  allAnnouncements = signal<Announcement[]>([
    { id: 1, title: 'Cancelación del Evento Karaoke-Chan', date: '19 de febrero 2026', content: 'Estimados estudiantes,\n\nSe les avisa que se cancela el evento Karaoke-Chan debido a problemas con las cafeteras brindadas por nuestro patrocinador.\n\nLes pedimos las disculpas del caso.', organizer: 'Organizador XXX' },
    { id: 2, title: 'Almuerzo Gratis en el B3!',           date: '19 de febrero 2026', content: 'Estimados estudiantes,\n\nSe les informa que el día de hoy habrá almuerzo gratis en el edificio B3 a partir de las 12:00 md.\n\nLos esperamos.', organizer: 'CASIE' },
    { id: 3, title: 'Evento Swimming Pool',                date: '19 de febrero 2026', content: 'Estimados estudiantes,\n\nSe les recuerda que el evento Swimming Pool se llevará a cabo este viernes en las instalaciones del TEC.\n\nCupos limitados.', organizer: 'Deportes TEC' },
    { id: 4, title: 'Hackathon TEC 2026',                  date: '01 de marzo 2026',   content: 'Estimados estudiantes,\n\nLes informamos que el Hackathon TEC 2026 está abierto para inscripciones. Equipos de 3 a 5 personas.\n\nFecha límite: 15 de marzo.', organizer: 'DATIC' },
    { id: 5, title: 'Cambio de sede Feria de Ciencias',    date: '05 de marzo 2026',   content: 'Estimados estudiantes,\n\nSe les comunica que la Feria de Ciencias cambia de sede al Gimnasio Principal.\n\nDisculpen los inconvenientes.', organizer: 'Vicerrectoría' },
    { id: 6, title: 'Apertura inscripciones BasketTeam',   date: '10 de marzo 2026',   content: 'Estimados estudiantes,\n\nYa están abiertas las inscripciones para el torneo de baloncesto interescuelas.\n\nFecha límite: 20 de marzo.', organizer: 'Deportes TEC' },
    { id: 7, title: 'Recordatorio: Torneo de Ajedrez',     date: '15 de marzo 2026',   content: 'Estimados estudiantes,\n\nSe les recuerda que el Torneo de Ajedrez inicia el próximo lunes. Presentarse 15 minutos antes.\n\nÉxitos.', organizer: 'CASIE' },
  ]);

  filteredAnnouncements = computed(() => {
    const date = this.selectedDate();
    if (!date) return this.allAnnouncements();
    return this.allAnnouncements().filter(a => a.date === date);
  });

  totalPages = computed(() =>
    Math.ceil(this.filteredAnnouncements().length / this.itemsPerPage)
  );

  pagedAnnouncements = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.filteredAnnouncements().slice(start, start + this.itemsPerPage);
  });

  setDate(value: string) {
    this.selectedDate.set(value);
    this.currentPage.set(1);
  }

  prevPage() {
    if (this.currentPage() > 1) this.currentPage.update(p => p - 1);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1);
  }
}
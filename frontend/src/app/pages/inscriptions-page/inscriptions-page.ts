import { Component, signal, computed,ViewEncapsulation  } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';

interface InscribedEvent {
  id: number;
  title: string;
  date: string;
  image: string;
  type: 'proximos' | 'pasados';
}

@Component({
  selector: 'app-inscriptions-page',
  standalone: true,
  imports: [Navbar, Footer, RouterLink],
  templateUrl: './inscriptions-page.html',
  styleUrl: './inscriptions-page.css',
  encapsulation: ViewEncapsulation.None
})
export class InscriptionsPage {

  activeTab = signal<'proximos' | 'pasados'>('proximos');

  showModal = signal(false);
  selectedEventId = signal<number | null>(null);

  currentPage = signal(1);
  itemsPerPage = 3;

  // 6 próximos + 6 pasados para demostrar paginación (2 páginas cada tab)
  allEvents = signal<InscribedEvent[]>([
    // Próximos — página 1
    { id: 1,  title: 'Swimming Pool',         date: '07 de mayo 2026',    image: 'events/swimmingpool.jpg', type: 'proximos' },
    { id: 2,  title: 'BasketTeam',            date: '10 de mayo 2026',    image: 'events/basketball.jpg',  type: 'proximos' },
    { id: 3,  title: 'Karaoke-Chan',          date: '15 de mayo 2026',    image: 'events/onichan.jpg',     type: 'proximos' },
    // Próximos — página 2
    { id: 4,  title: 'Coffee Station',        date: '20 de mayo 2026',    image: 'events/coffee.jpg',      type: 'proximos' },
    { id: 5,  title: 'Hackathon TEC',         date: '28 de mayo 2026',    image: 'events/hackathon.jpg',   type: 'proximos' },
    { id: 6,  title: 'Feria de Ciencias',     date: '03 de junio 2026',   image: 'events/feria.jpg',       type: 'proximos' },
    // Pasados — página 1
    { id: 7,  title: 'Soccer Team',           date: '19 de febrero 2026', image: 'events/soccer.jpg',      type: 'pasados'  },
    { id: 8,  title: 'Reading Club',          date: '19 de febrero 2026', image: 'events/reading.jpg',     type: 'pasados'  },
    { id: 9,  title: 'Soccer Match',          date: '01 de marzo 2026',   image: 'events/soccermatch.jpg', type: 'pasados'  },
    // Pasados — página 2
    { id: 10, title: 'Torneo de Ajedrez',     date: '10 de marzo 2026',   image: 'events/chess.jpg',       type: 'pasados'  },
    { id: 11, title: 'Taller de Fotografía',  date: '22 de marzo 2026',   image: 'events/photo.jpg',       type: 'pasados'  },
    { id: 12, title: 'Concierto Estudiantil', date: '01 de abril 2026',   image: 'events/concert.jpg',     type: 'pasados'  },
  ]);

  filteredEvents = computed(() =>
    this.allEvents().filter(e => e.type === this.activeTab())
  );

  totalPages = computed(() =>
    Math.ceil(this.filteredEvents().length / this.itemsPerPage)
  );

  pagedEvents = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.filteredEvents().slice(start, start + this.itemsPerPage);
  });

  setTab(tab: 'proximos' | 'pasados') {
    this.activeTab.set(tab);
    this.currentPage.set(1);
  }

  prevPage() {
    if (this.currentPage() > 1) this.currentPage.update(p => p - 1);
  }

  nextPage() {
    if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1);
  }

  openModal(eventId: number) {
    this.selectedEventId.set(eventId);
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.selectedEventId.set(null);
  }

  confirmUnsubscribe() {
    const id = this.selectedEventId();
    if (id !== null) {
      // TODO: llamar al backend DELETE /inscriptions/{id}
      this.allEvents.update(events => events.filter(e => e.id !== id));
    }
    this.closeModal();
  }
}


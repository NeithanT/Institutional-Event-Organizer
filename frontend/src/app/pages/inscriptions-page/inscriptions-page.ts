import { Component, signal, computed, ViewEncapsulation, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { InscriptionService } from '../../services/inscription.service';
import { Authentication } from '../../services/authentication';
import { EventService } from '../../services/event.service';

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
export class InscriptionsPage implements OnInit {

  activeTab = signal<'proximos' | 'pasados'>('proximos');
  showModal = signal(false);
  selectedEventId = signal<number | null>(null);
  currentPage = signal(1);
  itemsPerPage = 3;

  allEvents = signal<InscribedEvent[]>([]);

  constructor(
    private inscriptionService: InscriptionService,
    private auth: Authentication,
    private eventService: EventService
  ) {}

  ngOnInit() {
    const userId = this.auth.userId;
    if (userId <= 0) return;

    this.inscriptionService.getInscriptions(userId).subscribe({
      next: dtos => {
        this.allEvents.set(dtos.map(dto => ({
          id:    dto.eventId,
          title: dto.title,
          date:  new Date(dto.eventDate).toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' }),
          image: this.eventService.imageUrl(dto.imageFileEvent),
          type:  dto.isPast ? 'pasados' : 'proximos',
        })));
      }
    });
  }

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

  prevPage() { if (this.currentPage() > 1) this.currentPage.update(p => p - 1); }
  nextPage() { if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1); }

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
    const userId = this.auth.userId;
    if (id !== null && userId > 0) {
      this.inscriptionService.unsubscribe(id, userId).subscribe({
        next: () => {
          this.allEvents.update(events => events.filter(e => e.id !== id));
        }
      });
    }
    this.closeModal();
  }
}

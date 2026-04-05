import { Component, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { forkJoin, of } from 'rxjs';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { EventService } from '../../services/event.service';
import { InscriptionService } from '../../services/inscription.service';
import { Authentication } from '../../services/authentication';

interface EventDetail {
  id: number;
  title: string;
  content: string;
  organizer: string;
  cupos: number;
  fecha: string;
  isPast: boolean;
  isInscribed: boolean;
  isCanceled: boolean;
  cancelReason: string | null;
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
  private eventId = 0;

  constructor(
    private route: ActivatedRoute,
    private eventService: EventService,
    private inscriptionService: InscriptionService,
    private auth: Authentication
  ) {}

  ngOnInit() {
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));
    const userId = this.auth.userId;

    const inscriptions$ = userId > 0
      ? this.inscriptionService.getInscriptions(userId)
      : of([]);

    forkJoin([this.eventService.getEvent(this.eventId), inscriptions$]).subscribe({
      next: ([dto, inscriptions]) => {
        this.event.set({
          id:          dto.id,
          title:       dto.title,
          content:     dto.eventDescription,
          organizer:   dto.organizerName,
          cupos:       dto.availableEntries,
          fecha:       dto.eventDate,
          isPast:      new Date(dto.eventDate) < new Date(),
          isInscribed: inscriptions.some(i => i.eventId === dto.id),
          isCanceled:  dto.isCanceled,
          cancelReason: dto.cancelReason ?? null,
        });
      }
    });
  }

  inscribir() {
    const userId = this.auth.userId;
    if (userId <= 0) return;

    this.inscriptionService.inscribe(this.eventId, userId).subscribe({
      next: () => {
        this.event.update(e => e ? { ...e, cupos: e.cupos - 1, isInscribed: true } : e);
        this.showSuccessModal.set(true);
      }
    });
  }

  closeModal() {
    this.showSuccessModal.set(false);
  }

  getLines(content: string): string[] {
    return content.split('\n');
  }
}

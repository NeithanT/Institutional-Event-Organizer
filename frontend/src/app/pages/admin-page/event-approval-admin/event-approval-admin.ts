import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { BACKEND_BASE } from '../../../services/event.service';

interface PendingEvent {
  id: number;
  title: string;
  organizer: string;
  date: string;
  location: string;
  approved: boolean;
}

interface EventDetail {
  idEvent: number;
  title: string;
  eventDescription: string;
  place: string;
  isVirtual: boolean;
  eventDate: string;
  imageFileEvent: string | null;
  ImageFileEvent?: string | null;
  avalaibleEntries: number;
  AvalaibleEntries?: number;
}

@Component({
  selector: 'app-event-approval-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-approval-admin.html',
  styleUrl: './event-approval-admin.css',
})
export class EventApprovalAdmin implements OnInit {
  events: PendingEvent[] = [];
  selectedEvent: EventDetail | null = null;

  currentPage = 1;
  itemsPerPage = 10;
  get totalPages() { return Math.max(1, Math.ceil(this.events.length / this.itemsPerPage)); }
  get pagedEvents() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.events.slice(start, start + this.itemsPerPage);
  }
  prevPage() { if (this.currentPage > 1) this.currentPage--; }
  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.getEvents();
  }

  getEvents() {
    this.http.get<PendingEvent[]>(`${BACKEND_BASE}/administrator/events/pending`)
      .subscribe({
        next: (data) => { this.events = data; },
        error: (err) => { console.error(err); }
      });
  }

  openDetail(event: PendingEvent) {
    this.http.get<EventDetail>(`${BACKEND_BASE}/administrator/events/${event.id}`)
      .subscribe({
        next: (data) => { this.selectedEvent = data; },
        error: (err) => { console.error(err); }
      });
  }

  closeDetail() {
    this.selectedEvent = null;
  }

  approveEvent(eventId: number): void {
    this.http.post(`${BACKEND_BASE}/administrator/${eventId}/approve`, {})
      .subscribe({
        next: () => {
          this.events = this.events.filter(e => e.id !== eventId);
          if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
          this.selectedEvent = null;
        },
        error: (err) => { console.error(err); }
      });
  }

  imageUrl(path: string | null | undefined): string {
    if (!path || path.toLowerCase().includes('default')) return `${BACKEND_BASE}/images/default.jpg`;
    if (path.startsWith('http')) return path;
    return `${BACKEND_BASE}${path}`;
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}

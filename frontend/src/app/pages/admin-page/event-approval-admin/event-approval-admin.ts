import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { EventService } from '../../../services/event.service';

interface PendingEvent {
  id: number;
  title: string;
  organizer: string;
  date: string;
  location: string;
  approved: boolean;
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
  selectedEvent: any = null;

  currentPage = 1;
  itemsPerPage = 10;
  get totalPages() { return Math.max(1, Math.ceil(this.events.length / this.itemsPerPage)); }
  get pagedEvents() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.events.slice(start, start + this.itemsPerPage);
  }
  prevPage() { if (this.currentPage > 1) this.currentPage--; }
  nextPage() { if (this.currentPage < this.totalPages) this.currentPage++; }

  constructor(private http: HttpClient, private cdr: ChangeDetectorRef, public eventService: EventService) {}

  ngOnInit() {
    this.getEvents();
  }

  getEvents() {
    this.http.get<PendingEvent[]>('http://localhost:5053/administrator/events/pending')
      .subscribe({
        next: (data) => {
          this.events = data;
          this.cdr.detectChanges();
        },
        error: (err) => { console.error(err); }
      });
  }

  openDetail(event: PendingEvent) {
    this.http.get<any>(`http://localhost:5053/administrator/events/${event.id}`)
      .subscribe({
        next: (data) => {
          this.selectedEvent = data;
          this.cdr.detectChanges();
        },
        error: (err) => { console.error(err); }
      });
  }

  closeDetail() {
    this.selectedEvent = null;
    this.cdr.detectChanges();
  }

  approveEvent(eventId: number): void {
    this.http.post(`http://localhost:5053/administrator/${eventId}/approve`, {})
      .subscribe({
        next: () => {
          this.events = this.events.filter(e => e.id !== eventId);
          if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
          this.selectedEvent = null;
          this.cdr.detectChanges();
        },
        error: (err) => { console.error(err); }
      });
  }

  formatDate(date: string): string {
    return new Date(date).toLocaleDateString('es-CR', {
      day: 'numeric', month: 'long', year: 'numeric',
      hour: '2-digit', minute: '2-digit'
    });
  }
}

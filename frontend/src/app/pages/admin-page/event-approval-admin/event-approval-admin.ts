import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

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

  approveEvent(eventId: number): void {
    this.http.post(`http://localhost:5053/administrator/${eventId}/approve`, {})
      .subscribe({
        next: () => {
          this.events = this.events.filter(event => event.id !== eventId);
          if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
        },
        error: (err) => {
          console.error(err);
        }
      });
  }

  getEvents() {
    this.http.get<PendingEvent[]>('http://localhost:5053/administrator/events/pending')
      .subscribe({
        next: (data) => {
          this.events = data;
        },
        error: (err) => {
          console.error(err);
        }
      });
  }
}

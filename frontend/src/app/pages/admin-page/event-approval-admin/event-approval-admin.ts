import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import th from '@angular/common/locales/th';

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
  imports: [CommonModule, FormsModule],
  templateUrl: './event-approval-admin.html',
  styleUrl: './event-approval-admin.css',
})
export class EventApprovalAdmin implements OnInit {

  ref: ChangeDetectorRef = inject(ChangeDetectorRef);
  events: PendingEvent[] = [];
  rejectReason: string = '';
  errorMessage: string = '';
  rejectingEvent: boolean = false;
  rejectingEventId: number | null = null;

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

  approveEvent(eventId: number): void {

    this.http.post(`http://localhost:5053/administrator/${eventId}/approve`, {})
      .subscribe({
        next: (data) => {
          this.events = data;
          this.cdr.detectChanges();
        },
        error: (err) => { console.error(err); }
      });
  }

  getEvents() {
    this.currentPage = 1;
    this.http.get<PendingEvent[]>('http://localhost:5053/administrator/events/pending')
      .subscribe({
        next: (data) => {
          this.events = data;
          this.ref.markForCheck();
        },
        error: (err) => {
          console.error(err);
        }
      });
  }

  startRejecting(eventId: number) {
    this.rejectingEvent = true;
    this.rejectingEventId = eventId;
    this.rejectReason = '';
    this.errorMessage = '';
    this.ref.markForCheck();
  }

  rejectEvent(eventId: number): void {
    if ((this.rejectReason.trim()?.length ?? 0) < 100 || this.rejectReason.trim().length > 500) {
      this.errorMessage = "La razón de rechazo debe ser valida y al 100-500 caracteres.";
      this.ref.markForCheck();
      return;
    }

    this.http.post(`http://localhost:5053/administrator/${eventId}/reject`, { Reason: this.rejectReason })
      .subscribe({
        next: () => {
          this.rejectingEvent = false;
          this.rejectingEventId = null;
          this.rejectReason = '';
          this.errorMessage = '';
          this.getEvents();
        },
        error: (err) => { console.error(err); }
      });
  }

  cancelReject(): void {
    this.rejectingEvent = false;
    this.rejectingEventId = null;
    this.rejectReason = '';
    this.errorMessage = '';
    this.ref.markForCheck();
  }

  submitRejection(): void {
    if (this.rejectingEventId == null) return;
    this.rejectEvent(this.rejectingEventId);
  }
}

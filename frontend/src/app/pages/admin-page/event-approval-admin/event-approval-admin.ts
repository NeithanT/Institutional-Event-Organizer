import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
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
  imports: [CommonModule, FormsModule],
  templateUrl: './event-approval-admin.html',
  styleUrl: './event-approval-admin.css',
})
export class EventApprovalAdmin implements OnInit {

  ref: ChangeDetectorRef = inject(ChangeDetectorRef);
  events: PendingEvent[] = [];
  selectedEvent: any = null;
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

  openDetail(event: PendingEvent) {

    this.http.get<any>(`http://localhost:5053/administrator/events/${event.id}`)
      .subscribe({
        next: (dto) => {
          this.selectedEvent = {
            ...dto,
            idEvent: dto.idEvent ?? dto.id,
            imageFileEvent: dto.imageFileEvent ?? dto.ImageFileEvent,
            avalaibleEntries: dto.avalaibleEntries ?? dto.AvalaibleEntries ?? dto.availableEntries
          };
          this.ref.markForCheck();
        },
        error: (err) => { console.error('Failed to load admin event detail:', err); }
      });
  }

  closeDetail() {
    this.selectedEvent = null;
    this.ref.markForCheck();
  }

  formatDate(dateStr: string | Date | undefined | null) {
    if (!dateStr) return '';
    const d = new Date(dateStr as any);
    return d.toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  approveEvent(eventId: number): void {
    this.http.post(`/api/administrator/${eventId}/approve`, {})
      .subscribe({
        next: () => {
          this.closeDetail();
          this.getEvents();
          this.ref.markForCheck();
          this.cdr.detectChanges();
        },
        error: (err) => { console.error(err); }
      });
  }

  getEvents() {
    this.http.get<PendingEvent[]>('/api/administrator/events/pending')
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
          // Reset rejection state, close detail, refresh list and run change detection
          this.rejectingEvent = false;
          this.rejectingEventId = null;
          this.rejectReason = '';
          this.errorMessage = '';
          this.closeDetail();
          this.getEvents();
          this.ref.markForCheck();
          this.cdr.detectChanges();
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

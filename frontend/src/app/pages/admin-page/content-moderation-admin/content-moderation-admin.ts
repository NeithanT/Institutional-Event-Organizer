import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';

interface ContentModerationEvent {
  id: number;
  title: string;
  organizer: string;
  category: string;
  reports: number;
  approved: boolean;
  date: string;
  location: string;
}

@Component({
  selector: 'app-content-moderation-admin',
  standalone: true,
  imports: [CommonModule, HttpClientModule],
  templateUrl: './content-moderation-admin.html',
  styleUrl: './content-moderation-admin.css',
})
export class ContentModerationAdmin implements OnInit {
  events: ContentModerationEvent[] = [];
  isLoading = false;
  errorMessage = '';

  currentPage = 1;
  itemsPerPage = 10;
  get totalPages() { return Math.max(1, Math.ceil(this.events.length / this.itemsPerPage)); }
  get pagedEvents() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.events.slice(start, start + this.itemsPerPage);
  }
  prevPage() { if (this.currentPage > 1) { this.currentPage--; this.cdr.detectChanges(); } }
  nextPage() { if (this.currentPage < this.totalPages) { this.currentPage++; this.cdr.detectChanges(); } }

  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.loadEvents();
  }

  loadEvents(): void {
    this.errorMessage = '';
    this.isLoading = true;

    this.http
      .get<ContentModerationEvent[]>('http://localhost:5053/administrator/events/moderation')
      .subscribe({
        next: (data) => {
          this.events = data;
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = err?.error || 'No se pudo cargar los eventos para moderación.';
          this.cdr.detectChanges();
        },
        complete: () => {
          this.isLoading = false;
          this.cdr.detectChanges();
        },
      });
  }

  removeEvent(eventId: number): void {
    this.errorMessage = '';

    this.http
      .post(`http://localhost:5053/administrator/${eventId}/deny`, {
        reason: 'El evento fue removido por moderación.',
      })
      .subscribe({
        next: () => {
          this.events = this.events.filter((event) => event.id !== eventId);
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = err?.error || 'No se pudo remover el evento.';
          this.cdr.detectChanges();
        },
      });
  }
}

import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Sidebar } from '../../../components/sidebar/sidebar';
import { Authentication } from '../../../services/authentication';
import { RouterModule } from '@angular/router';
interface Event {
  id: number;
  title: string;
  eventDate: string;
  place: string;
  approvedState: boolean;
  imageFileEvent: string | null;
}

@Component({
  selector: 'app-organizer-dashboard',
  standalone: true,
imports: [CommonModule, Sidebar, RouterModule],
  templateUrl: './organizer-dashboard.html',
  styleUrl: './organizer-dashboard.css'
})
export class OrganizerDashboard implements OnInit {

  sidebarLinks = [
    { label: 'Crear Eventos', route: '/create-event' },
    { label: 'Mis Eventos', route: '/organizer-events' }
  ];

  organizerId: number = 0;
  events: Event[] = [];
  pendingCount: number = 0;
  approvedCount: number = 0;
  finishedCount: number = 0;

  // PAGINACIÓN
  currentPage: number = 1;
  itemsPerPage: number = 3;
  paginatedEvents: Event[] = [];
  totalPages: number = 1;

  constructor(
    private http: HttpClient,
    private auth: Authentication,
    private cdr: ChangeDetectorRef   
  ) {}

  ngOnInit() {
    this.organizerId = this.auth.userId;

    if (!this.organizerId) {
      console.error("No hay organizerId, usuario no autenticado");
      return;
    }

    this.loadEvents();
  }

  loadEvents() {
    this.http.get<Event[]>(
      `http://localhost:5053/organizer/my-events?organizerId=${this.organizerId}`
    )
    .subscribe({
      next: (data) => {
        this.events = [...data];    
        this.calculateStats();
        this.updatePagination();  
        this.cdr.detectChanges();  
      },
      error: (err) => console.error("Error cargando eventos:", err)
    });
  }

  calculateStats() {
    const now = new Date();
    this.pendingCount = this.events.filter(e => !e.approvedState).length;
    this.approvedCount = this.events.filter(e =>
      e.approvedState && new Date(e.eventDate) > now
    ).length;
    this.finishedCount = this.events.filter(e =>
      e.approvedState && new Date(e.eventDate) <= now
    ).length;
  }

  getEventStatus(event: Event): string {
    const now = new Date();
    const eventDate = new Date(event.eventDate);
    if (!event.approvedState) return 'pending';
    if (eventDate > now) return 'approved';
    return 'finished';
  }

  // PAGINACIÓN LOGIC
  updatePagination() {
    this.totalPages = Math.max(1, Math.ceil(this.events.length / this.itemsPerPage));

    const start = (this.currentPage - 1) * this.itemsPerPage;
    const end = start + this.itemsPerPage;

    this.paginatedEvents = this.events.slice(start, end);
  }

  nextPage() {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.updatePagination();
    }
  }

  previousPage() {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.updatePagination();
    }
  }

}
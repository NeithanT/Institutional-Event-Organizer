import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Authentication } from '../../../services/authentication';
import { Sidebar } from '../../../components/sidebar/sidebar';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, Sidebar, RouterModule, FormsModule],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.css'
})
export class EventDetail implements OnInit {

  eventId: number = 0;
  event: any = null;
  organizerId: number = 0;
  cancelReason: string = '';
  sidebarLinks = [
    { label: 'Crear Eventos', route: '/create-event' },
    { label: 'Mis Eventos', route: '/organizer-events' }
  ];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private auth: Authentication,
    private cdr: ChangeDetectorRef,
    private router: Router 
  ) {}

  ngOnInit() {
    this.organizerId = this.auth.userId;
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));

    if (!this.organizerId || !this.eventId) {
      console.error("Faltan datos");
      return;
    }

    this.loadEvent();
  }

  loadEvent() {
    this.http.get<any>(
      `http://localhost:5053/organizer/my-events/${this.eventId}?organizerId=${this.organizerId}`
    )
    .subscribe({
      next: (data) => {
        console.log("EVENT:", data);
        this.event = { ...data };      
        this.cdr.detectChanges();    
      },
      error: (err) => console.error("ERROR:", err)
    });
  }

  getEventStatus(): string {
    if (!this.event) return '';
    const now = new Date();
    const eventDate = new Date(this.event.eventDate);
    if (!this.event.approvedState) return 'pending';
    if (eventDate > now) return 'approved';
    return 'finished';
  }
cancelEvent() {
  const confirmacion = confirm('¿Estás seguro de que deseas cancelar este evento?');

  if (!confirmacion) return;

  const body = {
    organizerId: this.organizerId,
    reason: 'Cancelado por el organizador'
  };

  this.http.post(
    `http://localhost:5053/organizer/events/${this.eventId}/cancel`,
    body
  ).subscribe({
    next: () => {
      alert('Evento cancelado correctamente');
      this.router.navigate(['/organizer-events']);
    },
    error: (err) => {
      console.error("ERROR CANCELANDO:", err);
      alert('Error al cancelar el evento');
    }
  });
}
  // CONFIRMACIÓN
  confirmDelete() {
    const confirmacion = confirm('¿Estás seguro de que deseas eliminar este evento?');

    if (confirmacion) {
      this.deleteEvent();
    }
  }

  // DELETE REAL
  deleteEvent() {

    console.log("ELIMINANDO EVENTO:", this.eventId);
    console.log("ORGANIZER ID:", this.organizerId);

    this.http.delete(
      `http://localhost:5053/organizer/events/${this.eventId}?organizerId=${this.organizerId}`
    ).subscribe({
      next: () => {
        console.log("EVENTO ELIMINADO");
        alert('Evento eliminado correctamente');
        this.router.navigate(['/organizer-events']);
      },
      error: (err) => {
        console.error("ERROR ELIMINANDO:", err);
        alert('Error al eliminar el evento');
      }
    });
  }
}
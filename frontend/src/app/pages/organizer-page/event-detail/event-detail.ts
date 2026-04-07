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

  // Comunicado
  showNoticeModal: boolean = false;
  noticeTitle: string = '';
  noticeBody: string = '';

  //Asistencia
  showAttendanceModal: boolean = false;
  participants: any[] = [];

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
    if (!this.organizerId || !this.eventId) return;
    this.loadEvent();
  }

  loadEvent() {
    this.http.get<any>(
      `http://localhost:5053/organizer/my-events/${this.eventId}?organizerId=${this.organizerId}`
    ).subscribe({
      next: (data) => {
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

// ── ASISTENCIA ─────────────────────────────
openAttendanceModal() {
  this.showAttendanceModal = true;
  this.loadParticipants();
}

loadParticipants() {

  this.http.get<any[]>(
    `http://localhost:5053/organizer/events/${this.eventId}/check-list`
  ).subscribe({
    next: (data) => {

      console.log("PARTICIPANTES:", data);

      this.participants = data.map(p => ({
        ...p,
        attended: p.attended || false
      }));

      this.cdr.detectChanges();
    },
    error: (err) => console.error(err)
  });
}

toggleAttendance(user: any) {
  user.attended = !user.attended;
}

closeAttendanceModal() {
  this.showAttendanceModal = false;
  this.cdr.detectChanges();
}

saveAttendance() {

  this.participants.forEach(user => {

    if (user.attended) {
      this.http.post(
        `http://localhost:5053/organizer/events/${this.eventId}/check-list/${user.userId}`,
        {}
      ).subscribe();
    } else {
      this.http.delete(
        `http://localhost:5053/organizer/events/${this.eventId}/check-list/${user.userId}`
      ).subscribe();
    }

  });

  alert('✅ Asistencia actualizada');

  // 🔥 cerrar modal automáticamente
  this.closeAttendanceModal();
}

  // ── COMUNICADO ──────────────────────────────
  openNoticeModal() {
    this.noticeTitle = '';
    this.noticeBody = '';
    this.showNoticeModal = true;
  }

  closeNoticeModal() {
    this.showNoticeModal = false;
    this.cdr.detectChanges();
  }

sendNotice() {

  console.log("ENVIANDO COMUNICADO");

  if (!this.noticeTitle.trim() || !this.noticeBody.trim()) {
    alert('Debes completar todos los campos');
    return;
  }

  const body = {
    writerId: this.organizerId,
    title: this.noticeTitle.trim(),
    about: this.noticeTitle.trim(),
    body: this.noticeBody.trim()
  };

  this.http.post(
    `http://localhost:5053/organizer/events/${this.eventId}/notice`,
    body
  ).subscribe({
    next: () => {
      alert('Comunicado enviado a todos los participantes');
      this.closeNoticeModal();
      this.cdr.detectChanges(); 
      // limpiar (tipo cancelar)
      this.noticeTitle = '';
      this.noticeBody = '';
    },
    error: (err) => {
      console.error(err);
      alert('Error al enviar comunicado');
    }
  });
}
  // CANCELAR 
  cancelEvent() {
    const confirmacion = confirm('¿Estás seguro de que deseas cancelar este evento?');
    if (!confirmacion) return;

    const reason = prompt('Escribe el motivo de cancelación (se enviará a todos los participantes):');
    if (!reason || !reason.trim()) {
      alert('Debes escribir un motivo de cancelación');
      return;
    }

    const body = { organizerId: this.organizerId, reason: reason.trim() };

    this.http.post(
      `http://localhost:5053/organizer/events/${this.eventId}/cancel`,
      body
    ).subscribe({
      error: (err) => console.error("ERROR CANCELANDO:", err)
    });

    alert('Evento cancelado. Se notificará a todos los participantes.');
    this.router.navigate(['/organizer-events']);
  }

  // ── ELIMINAR ─────────────────────────────────
  confirmDelete() {
    if (confirm('¿Estás seguro de que deseas eliminar este evento?')) {
      this.deleteEvent();
    }
  }

  deleteEvent() {
    this.http.delete(
      `http://localhost:5053/organizer/events/${this.eventId}?organizerId=${this.organizerId}`
    ).subscribe({
      next: () => {
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
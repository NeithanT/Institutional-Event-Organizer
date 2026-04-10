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

  //Filtrado
  searchTerm: string = '';
  filteredParticipants: any[] = [];
  filterStatus: string = 'all';

  //Modal
  showModal: boolean = false;
  modalSuccess: boolean = true;
  modalTitle: string = '';
  modalMessage: string = '';

  // Modal cancelar
  showCancelModal: boolean = false;

  // Modal eliminar
  showDeleteModal: boolean = false;

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

  openModal(success: boolean, title: string, message: string) {
  this.modalSuccess = success;
  this.modalTitle = title;
  this.modalMessage = message;
  this.showModal = true;
}

  closeModal() {
    this.showModal = false;
  }

// ── ASISTENCIA ─────────────────────────────


// ABRIR MODAL
openAttendanceModal() {
  this.showAttendanceModal = true;
  this.loadParticipants();
}

filterParticipants() {

  const term = this.searchTerm.toLowerCase().trim();

  this.filteredParticipants = this.participants.filter(user => {

    const name = (user.fullName || '').toLowerCase();
    const id = (user.studentId || '').toString();

    //FILTRO DE TEXTO
    const matchesSearch = name.includes(term) || id.includes(term);

    // FILTRO DE ESTADO
    let matchesStatus = true;

    if (this.filterStatus === 'attended') {
      matchesStatus = user.attended === true;
    } 
    else if (this.filterStatus === 'not-attended') {
      matchesStatus = user.attended === false;
    }

    return matchesSearch && matchesStatus;
  });
}

// GET PARTICIPANTES
loadParticipants() {

  this.http.get<any[]>(
    `http://localhost:5053/organizer/events/${this.eventId}/check-list`
  ).subscribe({
    next: (data) => {

      console.log("PARTICIPANTES:", data);

      this.participants = data.map(p => ({
      userId: p.userId,
      fullName: p.userName,
      studentId: p.idCard,
      email: p.email,
      inscriptionDate: p.inscriptionDate,
      attended: p.assisted
    }));

      this.filteredParticipants = [...this.participants];
      this.cdr.detectChanges();
    },
    error: (err) => console.error(err)
  });
}

// CERRAR MODAL
closeAttendanceModal() {
  this.showAttendanceModal = false;
  this.cdr.detectChanges();
}

// GUARDAR ASISTENCIA
saveAttendance() {

  if (this.getEventStatus() === 'finished') {
    this.openModal(false, 'No permitido', 'No se puede modificar la asistencia de un evento finalizado');
    return;
  }

  this.participants.forEach(user => {
    if (user.attended) {
      this.http.post(
        `http://localhost:5053/organizer/events/${this.eventId}/check-list/${user.userId}`, {}
      ).subscribe();
    } else {
      this.http.delete(
        `http://localhost:5053/organizer/events/${this.eventId}/check-list/${user.userId}`
      ).subscribe();
    }
  });

  this.openModal(true, '¡Éxito!', 'Asistencia actualizada correctamente');
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

  if (!this.noticeTitle.trim() || !this.noticeBody.trim()) {
    this.showNoticeModal = false;
    this.cdr.detectChanges();
    Promise.resolve().then(() => {
      this.openModal(false, '¡Atención!', 'Debes completar todos los campos');
    });
    return;
  }

  const body = {
    writerId: this.organizerId,
    title: this.noticeTitle.trim(),
    about: this.noticeTitle.trim(),
    body: this.noticeBody.trim()
  };

  this.showNoticeModal = false;
  this.cdr.detectChanges();

  this.http.post(
    `http://localhost:5053/organizer/events/${this.eventId}/notice`,
    body
  ).subscribe({
    next: () => {
      this.openModal(true, '¡Enviado!', 'El comunicado fue enviado a todos los participantes');
      this.cdr.detectChanges();
    },
    error: () => {
      this.openModal(false, '¡Error!', 'No se pudo enviar el comunicado');
      this.cdr.detectChanges();
    }
  });
}

  // CANCELAR 
  openCancelModal() {
    this.cancelReason = '';
    this.showCancelModal = true;
  }

  closeCancelModal() {
    this.showCancelModal = false;
  }

confirmCancelEvent() {

  if (!this.cancelReason.trim()) {
    this.showCancelModal = false;
    this.cdr.detectChanges();
    Promise.resolve().then(() => {
      this.openModal(false, '¡Atención!', 'Debes escribir un motivo');
    });
    return;
  }

  const body = {
    organizerId: this.organizerId,
    reason: this.cancelReason.trim()
  };

  this.showCancelModal = false;
  this.cdr.detectChanges();

  // Mostrar éxito inmediatamente sin esperar emails
  Promise.resolve().then(() => {
    this.openModal(true, '¡Cancelado!', 'El evento se está cancelando y notificando a los participantes');
  });

  this.http.post(
    `http://localhost:5053/organizer/events/${this.eventId}/cancel`,
    body
  ).subscribe({
    next: () => {
      this.router.navigate(['/organizer-events']);
    },
    error: () => {
      this.showModal = false;
      this.cdr.detectChanges();
      Promise.resolve().then(() => {
        this.openModal(false, '¡Error!', 'No se pudo cancelar el evento');
      });
    }
  });
}
  // ── ELIMINAR ─────────────────────────────────
  openDeleteModal() {
    this.showDeleteModal = true;
  }

  closeDeleteModal() {
    this.showDeleteModal = false;
  }

  confirmDelete() {
    this.openDeleteModal();
  }

  deleteEvent() {
    this.http.delete(
      `http://localhost:5053/organizer/events/${this.eventId}?organizerId=${this.organizerId}`
    ).subscribe({
      next: () => {
        this.closeDeleteModal();
        this.openModal(true, 'Eliminado', 'Evento eliminado correctamente');
        this.router.navigate(['/organizer-events']);
      },
      error: () => {
        this.openModal(false, 'Error', 'No se pudo eliminar el evento');
      }
    });
  }
}
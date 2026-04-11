import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef } from '@angular/core';
import { Sidebar } from '../../../components/sidebar/sidebar';
import { Authentication } from '../../../services/authentication';

@Component({
  selector: 'app-edit-event',
  standalone: true,
  imports: [CommonModule, FormsModule, Sidebar, RouterModule],
  templateUrl: './edit-event.html',
  styleUrl: './edit-event.css',
})
export class EditEvent implements OnInit {

  sidebarLinks = [
    { label: 'Crear Eventos', route: '/create-event' },
    { label: 'Mis Eventos', route: '/organizer-events' }
  ];

  eventId: number = 0;
  organizerId: number = 0;
  categoryId: number = 0;
  avalaibleEntries: number = 0;

  title: string = '';
  description: string = '';
  date: string = '';
  place: string = '';
  isVirtual: boolean = false;

  //MODAL
  showModal: boolean = false;
  modalSuccess: boolean = true;
  modalTitle: string = '';
  modalMessage: string = '';


  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private auth: Authentication,
    private cdr: ChangeDetectorRef
  ) {}
  openModal(success: boolean, title: string, message: string) {
    this.modalSuccess = success;
    this.modalTitle = title;
    this.modalMessage = message;
    this.showModal = true;
  }

  closeModal() {
  this.showModal = false;
  if (this.modalSuccess) {
    this.router.navigate(['/organizer-events']);
  }
}
  ngOnInit() {
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));
    this.organizerId = this.auth.userId;
    this.loadEvent();
  }

  loadEvent() {
    this.http.get<any>(
      `/api/organizer/my-events/${this.eventId}?organizerId=${this.organizerId}`
    ).subscribe({
      next: (event) => {
        this.title            = event.title;
        this.description      = event.eventDescription;
        this.date             = event.eventDate.slice(0, 16);
        this.place            = event.place;
        this.isVirtual        = event.isVirtual;
        this.categoryId       = event.categoryId;
        this.avalaibleEntries = event.avalaibleEntries;
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error("ERROR CARGANDO EVENTO:", err);
        this.openModal(false, 'Error', 'No se pudo cargar el evento');
      }
    });
  }

  updateEvent() {

    if (
      !this.title.trim() ||
      !this.description.trim() ||
      !this.date ||
      !this.place.trim()
    ) {
      this.openModal(false, '¡Atención!', 'Todos los campos son obligatorios');
      return;
    }

    if (new Date(this.date) < new Date()) {
      this.openModal(false, '¡Atención!', 'No puedes seleccionar una fecha pasada');
      return;
    }

    if (this.title.length > 300) {
      this.openModal(false, '¡Atención!', 'El título no puede superar los 300 caracteres');
      return;
    }

    if (this.description.length > 300) {
      this.openModal(false, '¡Atención!', 'La descripción no puede superar los 300 caracteres');
      return;
    }

    if (this.place.length > 300) {
      this.openModal(false, '¡Atención!', 'El lugar no puede superar los 300 caracteres');
      return;
    }

    const body = {
      organizerId:      this.organizerId,
      idEvent:          this.eventId,
      title:            this.title,
      eventDescription: this.description,
      place:            this.place,
      isVirtual:        this.isVirtual,
      eventDate:        this.date + ':00',
      categoryId:       this.categoryId,
      avalaibleEntries: this.avalaibleEntries
    };

    this.http.put(
      `/api/organizer/events`,
      body
    ).subscribe({
      next: () => {

      this.openModal(true, '¡Éxito!', 'Evento actualizado correctamente');
      this.cdr.detectChanges();

    },
      error: () => {
      this.openModal(false, 'Error', 'No se pudo actualizar el evento');
    }
    });
  }
}

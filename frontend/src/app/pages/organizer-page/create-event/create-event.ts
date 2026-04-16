import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../../components/sidebar/sidebar';
import { Authentication } from '../../../services/authentication';

interface OrganizerEntity {
  id: number;
  entityName: string;
}

interface Category {
  id: number;
  nameCategory: string;
}

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [FormsModule, CommonModule, Sidebar],
  templateUrl: './create-event.html',
  styleUrl: './create-event.css'
})
export class CreateEvent implements OnInit {

  title: string = '';
  description: string = '';
  date: string = '';
  place: string = '';
  capacity: number = 0;
  isVirtual: boolean = false;
  categoryId: number = 0;
  organizerEntityId: number = 0;
  organizerId: number = 0;
  selectedFile: File | null = null;

  sidebarLinks = [
    { label: 'Crear Eventos', route: '/create-event' },
    { label: 'Mis Eventos', route: '/organizer-events' }
  ];

  organizerEntities: OrganizerEntity[] = [];
  categories: Category[] = [];

  //Modal
  showModal: boolean = false;
  modalSuccess: boolean = true;
  modalTitle: string = '';
  modalMessage: string = '';

  constructor(
    private http: HttpClient,
    private auth: Authentication,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit() {
    this.organizerId = this.auth.userId;
    this.loadOrganizerEntities();
    this.loadCategories();
  }

  //Abre el modal
  openModal(success: boolean, title: string, message: string) {
    this.modalSuccess = success;
    this.modalTitle = title;
    this.modalMessage = message;
    this.showModal = true;
    this.cdr.detectChanges();
  }

  closeModal() {
    this.showModal = false;
    this.cdr.detectChanges();
  }

  loadOrganizerEntities() {
    this.http.get<OrganizerEntity[]>('/api/organizer/get-entities')
      .subscribe({
        next: (data) => { this.organizerEntities = data; },
        error: () => { this.openModal(false, '¡Error!', 'No se pudieron cargar las unidades organizadoras'); }
      });
  }

  loadCategories() {
    this.http.get<Category[]>('/api/organizer/get-events-categories')
      .subscribe({
        next: (data) => { this.categories = data; },
        error: () => { this.openModal(false, '¡Error!', 'No se pudieron cargar las categorías'); }
      });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];
    if (file) this.selectedFile = file;
  }

  saveEvent() {

    if (
      !this.title.trim() ||
      !this.description.trim() ||
      !this.date ||
      !this.place.trim() ||
      this.capacity <= 0 ||
      !this.categoryId ||
      !this.organizerEntityId
    ) {
      this.openModal(false, '¡Atención!', 'Todos los campos son obligatorios');
      return;
    }

    if (new Date(this.date) < new Date()) {
      this.openModal(false, '¡Atención!', 'No puedes seleccionar una fecha pasada');
      return;
    }

    if (this.description.length > 300) {
      this.openModal(false, '¡Atención!', 'La descripción no puede superar los 300 caracteres');
      return;
    }

    if (this.title.length > 300) {
      this.openModal(false, '¡Atención!', 'El título no puede superar los 300 caracteres');
      return;
    }

    if (this.place.length > 300) {
      this.openModal(false, '¡Atención!', 'El lugar no puede superar los 300 caracteres');
      return;
    }

    const formData = new FormData();
    formData.append('Title', this.title);
    formData.append('EventDate', this.date);
    formData.append('Place', this.place);
    formData.append('EventDescription', this.description);
    formData.append('AvalaibleEntries', this.capacity.toString());
    formData.append('ApprovedState', 'false');
    formData.append('IsVirtual', this.isVirtual.toString());
    formData.append('CategoryId', this.categoryId.toString());
    formData.append('OrganizerId', this.organizerId.toString());
    formData.append('OrganizerEntityId', this.organizerEntityId.toString());
    if (this.selectedFile) formData.append('ImageFileEvent', this.selectedFile);

    this.http.post('/api/organizer/events', formData)
      .subscribe({
        next: () => {
          this.openModal(true, '¡Éxito!', 'El evento fue creado correctamente y está pendiente de aprobación');
        },
        error: () => {
          this.openModal(false, '¡Error!', 'Ocurrió un error al crear el evento, intenta de nuevo');
        }
      });
  }
}

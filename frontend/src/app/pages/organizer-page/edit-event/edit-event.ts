import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
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

  title: string = '';
  description: string = '';
  categoryId: number = 0;
  organizerEntityId: number = 0;
  date: string = '';
  capacity: number = 0;
  place: string = '';
  isVirtual: boolean = false;

  categories: any[] = [];
  organizerEntities: any[] = [];

  selectedFile: File | null = null;

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private router: Router,
    private auth: Authentication
  ) {}

  ngOnInit() {
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));
    this.organizerId = this.auth.userId;

    console.log("EVENT ID:", this.eventId);
    console.log("USER ID:", this.organizerId);

    this.loadCategories();
    this.loadEntities();
    this.loadEvent();
  }

  loadEvent() {
    this.http.get<any>(
      `http://localhost:5053/organizer/my-events/${this.eventId}?organizerId=${this.organizerId}`
    ).subscribe({
      next: (event) => {
        console.log("EVENT DATA:", event);

        this.title = event.title;
        this.description = event.eventDescription;
        this.categoryId = event.categoryId;
        this.organizerEntityId = event.organizerEntityId;
        this.date = event.eventDate.slice(0,16);
        this.capacity = event.avalaibleEntries;
        this.place = event.place;
        this.isVirtual = event.isVirtual;
      },
      error: (err) => {
        console.error("ERROR CARGANDO EVENTO:", err);
        alert("Error al cargar el evento");
      }
    });
  }

  loadCategories() {
    this.http.get<any[]>('http://localhost:5053/organizer/get-events-categories')
      .subscribe({
        next: (data) => {
          console.log('CATEGORIES:', data);
          this.categories = data;
        },
        error: (err) => console.error('ERROR CATEGORIES:', err)
      });
  }

  loadEntities() {
    this.http.get<any[]>('http://localhost:5053/organizer/get-entities')
      .subscribe({
        next: (data) => {
          console.log('ENTITIES:', data);
          this.organizerEntities = data;
        },
        error: (err) => console.error('ERROR ENTITIES:', err)
      });
  }

  onFileSelected(event: any) {
    const file = event.target.files[0];

    if (file) {
      this.selectedFile = file;
      console.log('Archivo seleccionado:', file);
    }
  }

  updateEvent() {

    console.log("=== VALIDANDO FORMULARIO ===");

    //VALIDACIÓN CAMPOS
    if (
      !this.title.trim() ||
      !this.description.trim() ||
      !this.date ||
      !this.place.trim() ||
      this.capacity <= 0 ||
      !this.categoryId ||
      !this.organizerEntityId
    ) {
      alert('Todos los campos son obligatorios');
      return;
    }

    // VALIDACIÓN FECHA
    const selectedDate = new Date(this.date);
    const now = new Date();

    if (selectedDate < now) {
      alert('No puedes seleccionar una fecha pasada');
      return;
    }

    //VALIDACIÓN LONGITUD 
    if (this.title.length > 300) {
      alert('El título no puede superar los 300 caracteres');
      return;
    }

    if (this.description.length > 300) {
      alert('La descripción no puede superar los 300 caracteres');
      return;
    }

    if (this.place.length > 300) {
      alert('El lugar no puede superar los 300 caracteres');
      return;
    }

    console.log("=== DATOS A ENVIAR ===");
    console.log({
      title: this.title,
      description: this.description,
      categoryId: this.categoryId,
      organizerEntityId: this.organizerEntityId,
      date: this.date,
      capacity: this.capacity,
      place: this.place,
      isVirtual: this.isVirtual,
      organizerId: this.organizerId
    });

    const formData = new FormData();

    formData.append('Title', this.title);
    formData.append('EventDescription', this.description);
    formData.append('CategoryId', this.categoryId.toString());
    formData.append('OrganizerEntityId', this.organizerEntityId.toString());
    formData.append('EventDate', new Date(this.date).toISOString());
    formData.append('AvalaibleEntries', this.capacity.toString());
    formData.append('Place', this.place);
    formData.append('IsVirtual', this.isVirtual.toString());
    formData.append('id', this.eventId.toString());
    if (this.selectedFile) {
      formData.append('ImageFileEvent', this.selectedFile);
    }

    this.http.post(
  `http://localhost:5053/organizer/events?organizerId=${this.organizerId}`,
  formData
).subscribe({
      next: (res) => {
        console.log("RESPUESTA:", res);
        alert('Evento actualizado correctamente');
        this.router.navigate(['/organizer-events']);
      },
      error: (err) => {
        console.error("ERROR ACTUALIZANDO:", err);
        alert('Error al actualizar el evento');
      }
    });
  }
}
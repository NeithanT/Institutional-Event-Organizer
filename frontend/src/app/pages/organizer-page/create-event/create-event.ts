import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../../components/sidebar/sidebar';
import { Authentication } from '../../../services/authentication';

//Interfaces
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
    { label: 'Mis Eventos', route: '/events' }
  ];

 
  organizerEntities: OrganizerEntity[] = [];
  categories: Category[] = [];

  constructor(
    private http: HttpClient,
    private auth: Authentication
  ) {}

  ngOnInit() {
    console.log("INIT FUNCIONANDO");
    this.organizerId = this.auth.userId;
    this.loadOrganizerEntities();
    this.loadCategories(); // 
    console.log("USER ID:", this.auth.userId);
    console.log("LOCAL STORAGE:", localStorage.getItem('authentication-user-id'));
    
  }

  //  traer unidades organizadoras
  loadOrganizerEntities() {
    this.http.get<OrganizerEntity[]>('http://localhost:5053/organizer/get-entities')
      .subscribe({
        next: (data) => {
          console.log('ENTITIES:', data);
          this.organizerEntities = data;
        },
        error: (err) => {
          console.error('ERROR ENTITIES:', err);
        }
      });
  }

  //  traer categorías dinámicas
  loadCategories() {
    this.http.get<Category[]>('http://localhost:5053/organizer/get-events-categories')
      .subscribe({
        next: (data) => {
          console.log('CATEGORIES:', data);
          this.categories = data;
        },
        error: (err) => {
          console.error('ERROR CATEGORIES:', err);
        }
      });
  }

  // captura archivo
  onFileSelected(event: any) {
    const file = event.target.files[0];

    if (file) {
      this.selectedFile = file;
      console.log('Archivo seleccionado:', file);
    }
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
    alert('Todos los campos son obligatorios');
    return;
  }

  //VALIDACIÓN DE LONGITUD (error que ya  pasó)
  if (this.description.length > 300) {
    alert('La descripción no puede superar los 300 caracteres');
    return;
  }

  if (this.title.length > 300) {
    alert('El título no puede superar los 300 caracteres');
    return;
  }

  if (this.place.length > 300) {
    alert('El lugar no puede superar los 300 caracteres');
    return;
  }


    const formattedDate = new Date(this.date).toISOString();
    const formData = new FormData();

    formData.append('Title', this.title);
    formData.append('EventDate', formattedDate);
    formData.append('Place', this.place);
    formData.append('EventDescription', this.description);
    formData.append('AvalaibleEntries', this.capacity.toString());
    formData.append('ApprovedState', 'false');
    formData.append('IsVirtual', this.isVirtual.toString());
    formData.append('CategoryId', this.categoryId.toString());
    formData.append('OrganizerId', this.organizerId.toString());
    formData.append('OrganizerEntityId', this.organizerEntityId.toString());


    if (this.selectedFile) {
      formData.append('ImageFileEvent', this.selectedFile);
    }

    this.http.post('http://localhost:5053/organizer/events', formData)
      .subscribe({
        next: (res) => {
          console.log(res);
          alert('Evento creado con éxito');
        },
        error: (err) => {
          console.error(err);
          alert('Error al crear el evento');
        }
      });
  }
}
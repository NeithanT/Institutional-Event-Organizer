import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [FormsModule, CommonModule], // 👈 AQUÍ
  templateUrl: './create-event.html',
  styleUrl: './create-event.css'
})

export class CreateEvent implements OnInit {

  title: string = '';
  description: string = '';
  date: string = '';
  place: string = '';
  capacity: number = 0;

  categoryId: number = 0;
  organizerId: number = 1; // ✅ fijo
  organizerEntityId: number = 0;

  selectedFile: File | null = null;

  // 🔥 lista dinámica desde backend
  organizerEntities: any[] = [];

  constructor(private http: HttpClient) {}

  // 🔥 se ejecuta al cargar la página
ngOnInit() {
  console.log("INIT FUNCIONANDO");
  this.loadOrganizerEntities();
}

  // 🔥 traer unidades organizadoras desde backend
loadOrganizerEntities() {
  this.http.get<any[]>('http://localhost:5053/organizer/get-entities')
    .subscribe({
      next: (data) => {
        console.log('DATA LLEGO:', data);
        this.organizerEntities = data;
      },
      error: (err) => {
        console.error('ERROR:', err);
      }
    });
}

  // 🔥 captura archivo real
  onFileSelected(event: any) {
    const file = event.target.files[0];

    if (file) {
      this.selectedFile = file;
      console.log('Archivo seleccionado:', file);
    }
  }

  saveEvent() {

    if (!this.categoryId || !this.organizerEntityId) {
      alert('Seleccione categoría y unidad organizadora');
      return;
    }

    const formattedDate = new Date(this.date).toISOString();

    const formData = new FormData();

    // 🔥 nombres EXACTOS del DTO (C#)
    formData.append('Title', this.title);
    formData.append('EventDate', formattedDate);
    formData.append('Place', this.place);
    formData.append('EventDescription', this.description);
    formData.append('AvalaibleEntries', this.capacity.toString());
    formData.append('ApprovedState', 'false');
    formData.append('CategoryId', this.categoryId.toString());
    formData.append('OrganizerId', this.organizerId.toString());
    formData.append('OrganizerEntityId', this.organizerEntityId.toString());

    // 🔥 archivo real (IFormFile)
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
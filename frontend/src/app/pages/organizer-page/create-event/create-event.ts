import { Component } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-create-event',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './create-event.html',
  styleUrl: './create-event.css'
})
export class CreateEvent {

  title: string = '';
  description: string = '';
  date: string = '';
  place: string = '';
  capacity: number = 0;

  categoryId: number = 0;
  organizerId: number = 1; // ✅ fijo
  organizerEntityId: number = 0;

  selectedFile: File | null = null; // 🔥 ahora sí archivo real

  constructor(private http: HttpClient) {}

  // ✅ captura el archivo real
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

    // 🔥 IMPORTANTE: nombres EXACTOS del DTO
    formData.append('Title', this.title);
    formData.append('EventDate', formattedDate);
    formData.append('Place', this.place);
    formData.append('EventDescription', this.description);
    formData.append('AvalaibleEntries', this.capacity.toString());
    formData.append('ApprovedState', 'false');
    formData.append('CategoryId', this.categoryId.toString());
    formData.append('OrganizerId', this.organizerId.toString());
    formData.append('OrganizerEntityId', this.organizerEntityId.toString());

    // 🔥 archivo real
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
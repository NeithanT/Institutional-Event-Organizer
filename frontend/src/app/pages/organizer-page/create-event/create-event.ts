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

  //Variables del formulario
  title: string = '';
  description: string = '';
  date: string = '';
  place: string = '';
  capacity: number = 0;
  category: string = '';
  organizer: string = '';
  mode: string = '';
  constructor(private http: HttpClient) {}

  //Función para guardar evento
  saveEvent() {

  const event = {
    title: this.title,
    eventDate: this.date,
    place: this.place,
    eventDescription: this.description,
    avalaibleEntries: this.capacity,
    approvedState: false,
    category: this.category,
    organizer: this.organizer,
    mode: this.mode
  };

  console.log('Enviando evento:', event);

  this.http.post('https://localhost:5000/events', event)
    .subscribe({
      next: (res) => {
        console.log('Evento guardado correctamente', res);
        alert('Evento creado con éxito');

        // limpiar formulario
        this.title = '';
        this.description = '';
        this.date = '';
        this.place = '';
        this.capacity = 0;
        this.category = '';
        this.organizer = '';
        this.mode = '';
      },
      error: (err) => {
        console.error('Error al guardar', err);
        alert('Error al crear el evento');
      }
    });
}

//Temporales para manejo de imagen
selectedFile: File | null = null;
imagePreview: string | null = null;

onFileSelected(event: any) {
  const file = event.target.files[0];

  if (file) {
    this.selectedFile = file;

    const reader = new FileReader();
    reader.onload = () => {
      this.imagePreview = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
}
}
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
  organizerEntityId: number = 0;
  mode: string = '';

  constructor(private http: HttpClient) {}

saveEvent() {
  const formattedDate = new Date(this.date).toISOString();

  const eventData = {
    title: this.title,
    eventDate: formattedDate,
    place: this.place,
    eventDescription: this.description,
    AvalaibleEntries: this.capacity,
    approvedState: false,
    categoryId: 1, // prueba fijo primero
    organizerId: 1,
    organizerEntityId: 1
  };

  console.log(eventData);

  this.http.post('http://localhost:5053/events', eventData)
    .subscribe({
      next: (res) => {
        console.log(res);
        alert('Evento creado con éxito');
      },
      error: (err) => {
        console.error(err); // 🔥 aquí está la clave
        alert('Error al crear el evento');
      }
    });
}
}
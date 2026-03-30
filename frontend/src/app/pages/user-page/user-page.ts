import { Component } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';

@Component({
  selector: 'app-user-page',
  standalone: true,
  imports: [Navbar, Footer],
  templateUrl: './user-page.html',
  styleUrl: './user-page.css'
})
export class UserPage {
  anuncios = [
    { titulo: 'Título: Cancelación del Evento Karaoke-Chan' },
    { titulo: 'Título: Aumento de Cupos en Evento Soccer Match!' },
  ];

  eventos = [
    { titulo: 'Evento 1', imagen: 'assets/evento1.jpg' },
    { titulo: 'Evento 2', imagen: 'assets/evento2.jpg' },
    { titulo: 'Evento 3', imagen: 'assets/evento3.jpg' },
    { titulo: 'Evento 4', imagen: 'assets/evento4.jpg' },
  ];
}
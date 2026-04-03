import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
 
@Component({
  selector: 'app-user-page',
  standalone: true,
  imports: [Navbar, Footer, RouterLink],
  templateUrl: './user-page.html',
  styleUrl: './user-page.css'
})
export class UserPage {
  anuncios = [
    { id: 1, titulo: 'Cancelación del Evento Karaoke-Chan',  fecha: '19 de febrero 2026' },
    { id: 2, titulo: 'Almuerzo Gratis en el B3!',            fecha: '19 de febrero 2026' },
    { id: 3, titulo: 'Evento Swimming Pool',                 fecha: '19 de febrero 2026' },
    { id: 4, titulo: 'Hackathon TEC 2026',                   fecha: '01 de marzo 2026'   },
    { id: 5, titulo: 'Cambio de sede Feria de Ciencias',     fecha: '05 de marzo 2026'   },
    { id: 6, titulo: 'Apertura inscripciones BasketTeam',    fecha: '10 de marzo 2026'   },
  ];

  eventos = [
    { id: 1,  titulo: 'Swimming Pool',        imagen: 'events/swimmingpool.jpg' },
    { id: 2,  titulo: 'BasketTeam',           imagen: 'events/basketball.jpg'  },
    { id: 3,  titulo: 'Karaoke-Chan',         imagen: 'events/onichan.jpg'     },
    { id: 4,  titulo: 'Coffee Station',       imagen: 'events/coffee.jpg'      },
    { id: 5,  titulo: 'Hackathon TEC',        imagen: 'events/hackathon.jpg'   },
    { id: 6,  titulo: 'Feria de Ciencias',    imagen: 'events/feria.jpg'       },
  ];
}
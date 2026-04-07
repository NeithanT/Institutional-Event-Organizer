import { Component, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { EventService } from '../../services/event.service';
import { AnnouncementService } from '../../services/announcement.service';

interface AnuncioItem {
  id: number;
  titulo: string;
  fecha: string;
}

interface EventoItem {
  id: number;
  titulo: string;
  imagen: string;
}

@Component({
  selector: 'app-user-page',
  standalone: true,
  imports: [Navbar, Footer, RouterLink],
  templateUrl: './user-page.html',
  styleUrl: './user-page.css'
})
export class UserPage implements OnInit {

  anuncios = signal<AnuncioItem[]>([]);
  eventos  = signal<EventoItem[]>([]);

  constructor(
    private eventService: EventService,
    private announcementService: AnnouncementService
  ) {}

  ngOnInit() {
    forkJoin([
      this.eventService.getEvents(),
      this.announcementService.getAnnouncements()
    ]).subscribe({
      next: ([eventDtos, annDtos]) => {
        this.eventos.set(eventDtos.slice(0, 6).map(dto => ({
          id:     dto.id,
          titulo: dto.title,
          imagen: this.eventService.imageUrl(dto.imageFileEvent),
        })));

        this.anuncios.set(annDtos.slice(0, 6).map(dto => ({
          id:     dto.id,
          titulo: dto.title,
          fecha:  dto.eventDate
            ? new Date(dto.eventDate).toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' })
            : '',
        })));
      }
    });
  }
}

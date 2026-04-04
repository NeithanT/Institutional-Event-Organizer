import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ContentEvent {
  id: number;
  title: string;
  organizer: string;
  category: string;
  reports: number;
}

@Component({
  selector: 'app-content-moderation-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './content-moderation-admin.html',
  styleUrl: './content-moderation-admin.css',
})
export class ContentModerationAdmin {
  events: ContentEvent[] = [
    {
      id: 1,
      title: 'Concurso de Talento Universitario',
      organizer: 'Comite Artistico',
      category: 'Cultural',
      reports: 0,
    },
    {
      id: 2,
      title: 'Foro de Debate Politico Estudiantil',
      organizer: 'Consejo Estudiantil',
      category: 'Academico',
      reports: 2,
    },
    {
      id: 3,
      title: 'Encuentro Nocturno de Integracion',
      organizer: 'Grupo Juventud',
      category: 'Recreativo',
      reports: 1,
    },
  ];

  removeEvent(eventId: number): void {
    this.events = this.events.filter((event) => event.id !== eventId);
  }
}

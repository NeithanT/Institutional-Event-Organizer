import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface PendingEvent {
  id: number;
  title: string;
  organizer: string;
  date: string;
  location: string;
  approved: boolean;
}

@Component({
  selector: 'app-event-approval-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './event-approval-admin.html',
  styleUrl: './event-approval-admin.css',
})
export class EventApprovalAdmin {
  events: PendingEvent[] = [
    {
      id: 1,
      title: 'Feria de Proyectos 2026',
      organizer: 'Facultad de Ingenieria',
      date: '2026-04-12',
      location: 'Auditorio Central',
      approved: false,
    },
    {
      id: 2,
      title: 'Seminario de Innovacion Educativa',
      organizer: 'Centro de Innovacion Docente',
      date: '2026-04-18',
      location: 'Sala B-204',
      approved: false,
    },
    {
      id: 3,
      title: 'Jornada de Voluntariado Comunitario',
      organizer: 'Departamento de Bienestar',
      date: '2026-04-24',
      location: 'Plaza Norte',
      approved: false,
    },
  ];

  approveEvent(eventId: number): void {
    this.events = this.events.map((event) =>
      event.id === eventId ? { ...event, approved: true } : event
    );
  }
}

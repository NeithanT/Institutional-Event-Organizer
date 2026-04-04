import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Sidebar } from '../../../components/sidebar/sidebar';

@Component({
  selector: 'app-organizer-dashboard',
  standalone: true,
  imports: [CommonModule, Sidebar],
  templateUrl: './organizer-dashboard.html',
  styleUrl: './organizer-dashboard.css',
})
export class OrganizerDashboard {
  sidebarLinks = [
    { label: 'Crear Eventos', route: '/create-event' },
    { label: 'Mis Eventos', route: '/events' }
  ];
}

import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface OrganizerItem {
  id: number;
  name: string;
  department: string;
  email: string;
  status: 'Activo' | 'Pendiente';
}

@Component({
  selector: 'app-organizer-management-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './organizer-management-admin.html',
  styleUrl: './organizer-management-admin.css',
})
export class OrganizerManagementAdmin {
  organizers: OrganizerItem[] = [
    {
      id: 1,
      name: 'Asociacion Estudiantil de Tecnologia',
      department: 'Ingenieria de Sistemas',
      email: 'aet@universidad.edu',
      status: 'Activo',
    },
    {
      id: 2,
      name: 'Comite de Cultura',
      department: 'Extension Cultural',
      email: 'cultura@universidad.edu',
      status: 'Pendiente',
    },
    {
      id: 3,
      name: 'Grupo de Investigacion BIO-LAB',
      department: 'Ciencias Naturales',
      email: 'biolab@universidad.edu',
      status: 'Activo',
    },
  ];
}

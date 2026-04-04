import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface ReportItem {
  id: number;
  title: string;
  generatedAt: string;
  status: 'Listo' | 'En progreso';
}

@Component({
  selector: 'app-report-generation-admin',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './report-generation-admin.html',
  styleUrl: './report-generation-admin.css',
})
export class ReportGenerationAdmin {
  reports: ReportItem[] = [
    {
      id: 1,
      title: 'Participacion por evento - Marzo',
      generatedAt: '2026-04-01 09:15',
      status: 'Listo',
    },
    {
      id: 2,
      title: 'Asistencia por facultad - Trimestre 1',
      generatedAt: '2026-04-02 13:40',
      status: 'Listo',
    },
    {
      id: 3,
      title: 'Solicitudes rechazadas y motivos',
      generatedAt: '2026-04-03 11:05',
      status: 'En progreso',
    },
  ];
}

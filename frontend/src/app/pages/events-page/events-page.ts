import { Component, signal, computed } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';

interface Event {
  id: number;
  titulo: string;
  imagen: string;
  fecha: string;
  tipo: string;
  modalidad: string;
  unidad: string;
}

@Component({
  selector: 'app-events-page',
  standalone: true,
  imports: [Navbar, Footer],
  templateUrl: './events-page.html',
  styleUrl: './events-page.css',
})
export class EventsPage {
  filterTipo = signal('');
  filterFecha = signal('');
  filterModalidad = signal('');
  filterUnidad = signal('');
  currentPage = signal(1);
  itemsPerPage = 3;

  eventos: Event[] = [
    { id: 1, titulo: 'Swimming Pool', imagen: 'assets/evento1.jpg', fecha: '2026-02-19', tipo: 'recreativo', modalidad: 'presencial', unidad: 'Deportes' },
    { id: 2, titulo: 'BasketTeam', imagen: 'assets/evento2.jpg', fecha: '2026-02-19', tipo: 'recreativo', modalidad: 'presencial', unidad: 'Deportes' },
    { id: 3, titulo: 'Karaoke-Chan', imagen: 'assets/evento3.jpg', fecha: '2026-02-19', tipo: 'cultural', modalidad: 'presencial', unidad: 'CASIE' },
    { id: 4, titulo: 'Congreso IA', imagen: 'assets/evento4.jpg', fecha: '2026-04-10', tipo: 'academico', modalidad: 'virtual', unidad: 'DATIC' },
    { id: 5, titulo: 'Festival Arte', imagen: 'assets/evento1.jpg', fecha: '2026-04-15', tipo: 'cultural', modalidad: 'presencial', unidad: 'CASIE' },
  ];

  filteredEventos = computed(() => {
    const hoy = new Date();
    return this.eventos.filter(e => {
      const fecha = new Date(e.fecha);
      if (this.filterTipo() && e.tipo !== this.filterTipo()) return false;
      if (this.filterModalidad() && e.modalidad !== this.filterModalidad()) return false;
      if (this.filterUnidad() && e.unidad !== this.filterUnidad()) return false;
      if (this.filterFecha()) {
        const diffDays = (fecha.getTime() - hoy.getTime()) / (1000 * 60 * 60 * 24);
        if (this.filterFecha() === 'proximos' && diffDays < 0) return false;
        if (this.filterFecha() === 'semana' && (diffDays < 0 || diffDays > 7)) return false;
        if (this.filterFecha() === 'mes' && (diffDays < 0 || diffDays > 30)) return false;
      }
      return true;
    });
  });

  paginatedEventos = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.filteredEventos().slice(start, start + this.itemsPerPage);
  });

  totalPages = computed(() =>
    Math.ceil(this.filteredEventos().length / this.itemsPerPage)
  );

  setFiltro(tipo: string, valor: string) {
    this.currentPage.set(1);
    if (tipo === 'tipo') this.filterTipo.set(valor);
    if (tipo === 'fecha') this.filterFecha.set(valor);
    if (tipo === 'modalidad') this.filterModalidad.set(valor);
    if (tipo === 'unidad') this.filterUnidad.set(valor);
  }

  prevPage() { if (this.currentPage() > 1) this.currentPage.update(p => p - 1); }
  nextPage() { if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1); }

  formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' });
  }
}
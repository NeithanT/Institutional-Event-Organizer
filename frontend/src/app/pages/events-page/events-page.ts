import { Component, signal, computed } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';

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
  imports: [Navbar, Footer, RouterLink, FormsModule],
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

  // ngModel necesita una propiedad normal, no signal
  selectedDate = '';

  eventos: Event[] = [
    { id: 1, titulo: 'Swimming Pool', imagen: 'events/swimmingpool.jpg', fecha: '2026-05-07T10:00', tipo: 'recreativo', modalidad: 'presencial', unidad: 'Deportes' },
    { id: 2, titulo: 'BasketTeam',    imagen: 'events/basketball.jpg',   fecha: '2026-05-10T14:00', tipo: 'recreativo', modalidad: 'presencial', unidad: 'Deportes' },
    { id: 3, titulo: 'Karaoke-Chan',  imagen: 'events/onichan.jpg',      fecha: '2026-05-15T19:00', tipo: 'cultural',   modalidad: 'presencial', unidad: 'CASIE'   },
    { id: 4, titulo: 'Congreso IA',   imagen: 'events/evento4.jpg',      fecha: '2026-05-20T09:00', tipo: 'academico',  modalidad: 'virtual',    unidad: 'DATIC'   },
    { id: 5, titulo: 'Festival Arte', imagen: 'events/evento1.jpg',      fecha: '2026-06-01T11:00', tipo: 'cultural',   modalidad: 'presencial', unidad: 'CASIE'   },
    { id: 6, titulo: 'Coffee Station',imagen: 'events/coffee.jpg',       fecha: '2026-06-03T08:00', tipo: 'cultural',   modalidad: 'presencial', unidad: 'CASIE'   },
  ];

  filteredEventos = computed(() => {
    return this.eventos.filter(e => {
      const fechaEvento = new Date(e.fecha);
      if (this.filterTipo() && e.tipo !== this.filterTipo()) return false;
      if (this.filterModalidad() && e.modalidad !== this.filterModalidad()) return false;
      if (this.filterUnidad() && e.unidad !== this.filterUnidad()) return false;
      if (this.filterFecha()) {
        const fechaFiltro = new Date(this.filterFecha());
        const mismodia =
          fechaEvento.getFullYear() === fechaFiltro.getFullYear() &&
          fechaEvento.getMonth()    === fechaFiltro.getMonth()    &&
          fechaEvento.getDate()     === fechaFiltro.getDate();
        if (!mismodia) return false;
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
    if (tipo === 'tipo')      this.filterTipo.set(valor);
    if (tipo === 'modalidad') this.filterModalidad.set(valor);
    if (tipo === 'unidad')    this.filterUnidad.set(valor);
  }

  onDateChange(value: string) {
    this.currentPage.set(1);
    this.filterFecha.set(value);
  }

  clearDate() {
    this.selectedDate = '';
    this.filterFecha.set('');
    this.currentPage.set(1);
  }

  prevPage() { if (this.currentPage() > 1) this.currentPage.update(p => p - 1); }
  nextPage() { if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1); }

  formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}
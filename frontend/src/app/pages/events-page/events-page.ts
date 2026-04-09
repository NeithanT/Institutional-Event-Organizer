import { Component, signal, computed, OnInit } from '@angular/core';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { EventService, EventFilters, BACKEND_BASE } from '../../services/event.service';

interface OrganizerEntity {
  id: number;
  entityName: string;
}

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
export class EventsPage implements OnInit {
  filterTipo = signal('');
  filterFecha = signal('');
  filterModalidad = signal('');
  filterUnidad = signal('');
  currentPage = signal(1);
  itemsPerPage = 10;

  selectedDate = '';

  eventos = signal<Event[]>([]);
  organizerEntities = signal<OrganizerEntity[]>([]);
  categories = signal<{ id: number; nameCategory: string }[]>([]);

  constructor(private eventService: EventService, private http: HttpClient) {}

  ngOnInit() {
    this.loadEvents();
    this.http.get<OrganizerEntity[]>(`${BACKEND_BASE}/organizer/get-entities`).subscribe({
      next: data => this.organizerEntities.set(data)
    });
    this.http.get<{ id: number; nameCategory: string }[]>(`${BACKEND_BASE}/organizer/get-events-categories`).subscribe({
      next: data => this.categories.set(data)
    });
  }

  private loadEvents() {
    this.currentPage.set(1);
    const filters: EventFilters = {};
    if (this.filterTipo())      filters.category        = this.filterTipo();
    if (this.filterModalidad()) filters.modality        = this.filterModalidad();
    if (this.filterUnidad())    filters.organizerEntity = this.filterUnidad();
    if (this.filterFecha())     filters.date            = this.filterFecha().split('T')[0];

    const now = new Date();
    this.eventService.getEvents(filters).subscribe({
      next: dtos => {
        this.eventos.set(dtos
          .filter(dto => new Date(dto.eventDate) > now)
          .map(dto => ({
            id:        dto.id,
            titulo:    dto.title,
            imagen:    this.eventService.imageUrl(dto.imageFileEvent),
            fecha:     dto.eventDate,
            tipo:      dto.category.toLowerCase(),
            modalidad: dto.isVirtual ? 'virtual' : 'presencial',
            unidad:    dto.organizerEntity,
          })));
      }
    });
  }

  paginatedEventos = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.eventos().slice(start, start + this.itemsPerPage);
  });

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.eventos().length / this.itemsPerPage))
  );

  setFiltro(tipo: string, valor: string) {
    if (tipo === 'tipo')      this.filterTipo.set(valor);
    if (tipo === 'modalidad') this.filterModalidad.set(valor);
    if (tipo === 'unidad')    this.filterUnidad.set(valor);
    this.loadEvents();
  }

  onDateChange(value: string) {
    this.filterFecha.set(value);
    this.loadEvents();
  }

  clearDate() {
    this.selectedDate = '';
    this.filterFecha.set('');
    this.loadEvents();
  }

  prevPage() { if (this.currentPage() > 1) this.currentPage.update(p => p - 1); }
  nextPage() { if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1); }

  formatFecha(fecha: string): string {
    return new Date(fecha).toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
  }
}

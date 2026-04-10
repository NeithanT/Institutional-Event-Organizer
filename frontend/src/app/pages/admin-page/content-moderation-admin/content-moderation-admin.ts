import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';

interface CategoryOption {
  id: number;
  nameCategory: string;
}

interface OrganizerOption {
  id: number;
  entityName: string;
}

interface ModerationEventRow {
  id: number;
  title: string;
  organizer: string;
  category: string;
  date: string;
  location: string;
  approved: boolean;
}

interface EditEventDto {
  organizerId: number;
  organizerEntityId: number | null;
  categoryId: number | null;
  approvedState: boolean;
  idEvent: number;
  title: string;
  eventDescription: string;
  place: string;
  isVirtual: boolean;
  eventDate: string;
}

@Component({
  selector: 'app-content-moderation-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './content-moderation-admin.html',
  styleUrl: './content-moderation-admin.css',
})
export class ContentModerationAdmin implements OnInit {
  events: ModerationEventRow[] = [];
  categories: CategoryOption[] = [];
  organizers: OrganizerOption[] = [];

  isLoading = false;
  modifying = false;
  errorMessage = '';

  modifiedEvent: EditEventDto = this.createEmptyEditEvent();
  modifiedOrganizerEntityId: number | null = null;
  modifiedOrganizerUserId: number | null = null;
  modifiedCategoryId: number | null = null;

  minDate = '';

  currentPage = 1;
  itemsPerPage = 10;

  private readonly http = inject(HttpClient);
  private readonly cdr = inject(ChangeDetectorRef);

  get totalPages(): number {
    return Math.max(1, Math.ceil(this.events.length / this.itemsPerPage));
  }

  get pagedEvents(): ModerationEventRow[] {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.events.slice(start, start + this.itemsPerPage);
  }

  prevPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.cdr.detectChanges();
    }
  }

  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.cdr.detectChanges();
    }
  }

  ngOnInit(): void {
    this.minDate = this.computeMinDate();
    this.loadCategories();
    this.loadOrganizers();
    this.loadEvents();
  }

  private createEmptyEditEvent(): EditEventDto {
    return {
      organizerId: 0,
      organizerEntityId: null,
      categoryId: null,
      approvedState: false,
      idEvent: 0,
      title: '',
      eventDescription: '',
      place: '',
      isVirtual: false,
      eventDate: '',
    };
  }

  private getErrorMessage(err: any, fallback: string): string {
    const backendError = err?.error;

    if (typeof backendError === 'string' && backendError.trim().length > 0) {
      return backendError;
    }

    if (backendError && typeof backendError === 'object') {
      if (typeof backendError.message === 'string' && backendError.message.trim().length > 0) {
        return backendError.message;
      }

      if (backendError.errors && typeof backendError.errors === 'object') {
        const firstFieldErrors = Object.values(backendError.errors).find(
          (messages) => Array.isArray(messages) && messages.length > 0
        ) as string[] | undefined;

        if (firstFieldErrors?.[0]) {
          return firstFieldErrors[0];
        }
      }
    }

    if (typeof err?.message === 'string' && err.message.trim().length > 0) {
      return err.message;
    }

    return fallback;
  }

  private toDateInputValue(value: string | Date | undefined): string {
    if (!value) {
      return '';
    }

    if (typeof value === 'string') {
      return value.split('T')[0];
    }

    const parsed = new Date(value);
    if (isNaN(parsed.getTime())) {
      return '';
    }

    const year = parsed.getFullYear();
    const month = String(parsed.getMonth() + 1).padStart(2, '0');
    const day = String(parsed.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  private computeMinDate(): string {
    const date = new Date();
    date.setDate(date.getDate() + 1);

    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  loadEvents(): void {
    this.errorMessage = '';
    this.isLoading = true;

    this.http.get<ModerationEventRow[]>('http://localhost:5053/administrator/events/moderation').subscribe({
      next: (data) => {
        this.events = data ?? [];

        if (this.currentPage > this.totalPages) {
          this.currentPage = this.totalPages;
        }

        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = this.getErrorMessage(err, 'No se pudo cargar los eventos para moderación.');
        this.isLoading = false;
        this.cdr.detectChanges();
      },
    });
  }

  removeEvent(eventId: number): void {
    this.errorMessage = '';

    this.http
      .post(`http://localhost:5053/administrator/${eventId}/deny`, {
        reason: 'El evento fue removido por moderación.',
      })
      .subscribe({
        next: () => {
          this.events = this.events.filter((event) => event.id !== eventId);

          if (this.currentPage > this.totalPages) {
            this.currentPage = this.totalPages;
          }

          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = this.getErrorMessage(err, 'No se pudo remover el evento.');
          this.cdr.detectChanges();
        },
      });
  }

  modifyEvent(event: ModerationEventRow): void {
    this.errorMessage = '';

    this.http.get<EditEventDto>(`http://localhost:5053/administrator/events/${event.id}`).subscribe({
      next: (full) => {
        this.modifiedEvent = {
          ...full,
          eventDate: this.toDateInputValue(full.eventDate),
        };
        this.modifiedOrganizerUserId = full.organizerId;
        this.modifiedOrganizerEntityId = full.organizerEntityId;
        this.modifiedCategoryId = full.categoryId;
        this.modifying = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = this.getErrorMessage(err, 'No se pudo cargar el evento completo para editar.');
        this.cdr.detectChanges();
      },
    });
  }

  loadCategories(): void {
    this.http.get<CategoryOption[]>('http://localhost:5053/organizer/get-events-categories').subscribe({
      next: (data) => {
        this.categories = data ?? [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading categories', err);
      },
    });
  }

  loadOrganizers(): void {
    this.http.get<OrganizerOption[]>('http://localhost:5053/organizer/get-entities').subscribe({
      next: (data) => {
        this.organizers = data ?? [];
        this.cdr.detectChanges();
      },
      error: (err) => {
        console.error('Error loading organizer entities', err);
      },
    });
  }

  cancelModify(): void {
    this.modifying = false;
    this.modifiedEvent = this.createEmptyEditEvent();
    this.modifiedOrganizerEntityId = null;
    this.modifiedOrganizerUserId = null;
    this.modifiedCategoryId = null;
    this.cdr.detectChanges();
  }

  saveModifiedEvent(): void {
    this.errorMessage = '';

    const title = this.modifiedEvent.title.trim();
    const eventDescription = this.modifiedEvent.eventDescription.trim();
    const place = this.modifiedEvent.place.trim();
    const eventDate = this.modifiedEvent.eventDate ? new Date(`${this.modifiedEvent.eventDate}T00:00:00`) : null;

    if (!this.modifiedEvent.idEvent || !this.modifiedOrganizerUserId || !this.modifiedOrganizerEntityId || !this.modifiedCategoryId) {
      this.errorMessage = 'Seleccione un organizador, una entidad y una categoría válidos.';
      this.cdr.detectChanges();
      return;
    }

    if (!title || !eventDescription || !place || !eventDate || isNaN(eventDate.getTime()) || eventDate < new Date()) {
      this.errorMessage = 'Por favor complete título, descripción, lugar y fecha futura antes de guardar.';
      this.cdr.detectChanges();
      return;
    }

    const payload: EditEventDto = {
      organizerId: this.modifiedOrganizerUserId,
      organizerEntityId: this.modifiedOrganizerEntityId,
      categoryId: this.modifiedCategoryId,
      approvedState: this.modifiedEvent.approvedState,
      idEvent: this.modifiedEvent.idEvent,
      title,
      eventDescription,
      place,
      isVirtual: this.modifiedEvent.isVirtual,
      eventDate: `${this.modifiedEvent.eventDate}T00:00:00`,
    };

    this.http.put(`http://localhost:5053/administrator/events/${payload.idEvent}`, payload).subscribe({
      next: () => {
        const idx = this.events.findIndex((event) => event.id === payload.idEvent);
        if (idx !== -1) {
          const organizerName = this.organizers.find((organizer) => organizer.id === payload.organizerEntityId)?.entityName;
          const categoryName = this.categories.find((category) => category.id === payload.categoryId)?.nameCategory;

          this.events[idx] = {
            ...this.events[idx],
            title,
            date: this.modifiedEvent.eventDate,
            location: place,
            category: categoryName ?? this.events[idx].category,
            organizer: organizerName ?? this.events[idx].organizer,
            approved: payload.approvedState,
          };
        }

        this.cancelModify();
      },
      error: (err) => {
        this.errorMessage = this.getErrorMessage(err, 'No se pudo guardar el evento.');
        this.cdr.detectChanges();
      },
    });
  }
}

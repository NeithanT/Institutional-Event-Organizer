import { ChangeDetectorRef, Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { FormsModule } from '@angular/forms';

interface ContentModerationEvent {
  id: number;
  title: string;
  organizer: string;
  category: string;
  approved: boolean;
  date: string;
  location: string;
  eventDescription?: string;
  isVirtual?: boolean;
}

interface Category {
  id: number;
  nameCategory: string;
}

interface OrganizerInfo {
  id: number;
  entityName: string;
}

interface EventDetailsResponse {
  id: number;
  title: string;
  eventDescription: string;
  eventDate: string;
  place: string;
  isVirtual: boolean;
  organizerUserId: number;
  organizerEntityId: number;
  organizerEntity: OrganizerInfo;
  category: Category;
  approved: boolean;
}

interface EditEventDto {
  OrganizerId: number;
  OrganizerEntityId: number;
  CategoryId: number;
  ApprovedState: boolean;
  IdEvent: number;
  Title: string;
  EventDescription: string;
  Place: string;
  IsVirtual: boolean;
  EventDate: string;
}

interface EditEventPayload {
  editEventDto: EditEventDto;
}


@Component({
  selector: 'app-content-moderation-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './content-moderation-admin.html',
  styleUrl: './content-moderation-admin.css',
})
export class ContentModerationAdmin implements OnInit {

  events: ContentModerationEvent[] = [];
  isLoading = false;
  modifying = false;
  errorMessage = '';

  modifiedEvent: ContentModerationEvent = {} as ContentModerationEvent;
  modifiedOrganizerEntityId: number | null = null;
  modifiedOrganizerUserId: number | null = null;
  modifiedCategoryId: number | null = null;

  // Min date for the date picker (only allow future days)
  minDate: string = '';

  categories: Category[] = [];
  organizers: OrganizerInfo[] = [];

  currentPage = 1;
  itemsPerPage = 10;
  get totalPages() { return Math.max(1, Math.ceil(this.events.length / this.itemsPerPage)); }
  get pagedEvents() {
    const start = (this.currentPage - 1) * this.itemsPerPage;
    return this.events.slice(start, start + this.itemsPerPage);
  }
  prevPage() { if (this.currentPage > 1) { this.currentPage--; this.cdr.detectChanges(); } }
  nextPage() { if (this.currentPage < this.totalPages) { this.currentPage++; this.cdr.detectChanges(); } }

  private http = inject(HttpClient);
  private cdr = inject(ChangeDetectorRef);

  ngOnInit(): void {
    this.minDate = this.computeMinDate();
    this.loadCategories();
    this.loadOrganizers();
    this.loadEvents();
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
        const firstFieldErrors = Object.values(backendError.errors)
          .find((messages) => Array.isArray(messages) && messages.length > 0) as string[] | undefined;
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

  loadEvents(): void {
    this.errorMessage = '';
    this.isLoading = true;

    this.http
      .get<ContentModerationEvent[]>('http://localhost:5053/administrator/events/moderation')
      .subscribe({
        next: (data) => {
          this.events = data;
          if (this.currentPage > this.totalPages) {
            this.currentPage = this.totalPages;
          }
          this.cdr.detectChanges();
        },
        error: (err) => {
          this.errorMessage = this.getErrorMessage(err, 'No se pudo cargar los eventos para moderación.');
          this.cdr.detectChanges();
        },
        complete: () => {
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

  modifyEvent(event: ContentModerationEvent): void {
    this.errorMessage = '';

    this.http.get<EventDetailsResponse>(`http://localhost:5053/administrator/events/${event.id}`).subscribe({
      next: (full) => {
        const dateStr = this.toDateInputValue(full.eventDate ?? event.date);

        this.modifiedEvent = {
          id: full.id ?? event.id,
          title: full.title ?? event.title,
          organizer: full.organizerEntity?.entityName ?? event.organizer,
          category: (full.category?.nameCategory) ?? event.category,
          approved: full.approved ?? event.approved,
          date: dateStr,
          location: full.place ?? event.location,
          eventDescription: full.eventDescription ?? '',
          isVirtual: full.isVirtual ?? false,
        } as ContentModerationEvent;

        this.modifiedOrganizerUserId = full.organizerUserId ?? null;
        this.modifiedOrganizerEntityId = full.organizerEntityId ?? full.organizerEntity?.id ?? null;
        this.modifiedCategoryId = full.category?.id ?? null;

        if (this.modifiedOrganizerEntityId == null && this.modifiedEvent.organizer) {
          const matchOrganizer = this.organizers.find((o) => o.entityName === this.modifiedEvent.organizer);
          this.modifiedOrganizerEntityId = matchOrganizer?.id ?? null;
        }

        if (this.modifiedCategoryId == null && this.modifiedEvent.category) {
          const matchCategory = this.categories.find((c) => c.nameCategory === this.modifiedEvent.category);
          this.modifiedCategoryId = matchCategory?.id ?? null;
        }

        this.modifying = true;
        this.cdr.detectChanges();
      },
      error: (err) => {
        this.errorMessage = this.getErrorMessage(err, 'No se pudo cargar el evento completo para editar.');
        this.cdr.detectChanges();
      }
    });
  }

  private computeMinDate(): string {
    const d = new Date();
    d.setDate(d.getDate() + 1); // tomorrow
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');

    return `${year}-${month}-${day}`;
  }

  loadCategories(): void {
    this.http.get<Category[]>('http://localhost:5053/organizer/get-events-categories')
      .subscribe({
        next: (data) => {
          this.categories = data;

          if (this.modifying && this.modifiedCategoryId == null && this.modifiedEvent?.category) {
            const match = this.categories.find((c) => c.nameCategory === this.modifiedEvent.category);
            if (match) {
              this.modifiedCategoryId = match.id;
            }
          }

          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading categories', err);
        }
      });
  }

  loadOrganizers(): void {
    this.http.get<OrganizerInfo[]>('http://localhost:5053/organizer/get-entities')
      .subscribe({
        next: (data) => {
          // endpoint returns { EntityName, Id }
          this.organizers = (data ?? []).map((e: any) => ({ id: e.Id ?? e.id, entityName: e.EntityName ?? e.entityName }));

          // if currently modifying an event, try to set the selected organizer entity id
          if (this.modifying && this.modifiedOrganizerEntityId == null && this.modifiedEvent?.organizer) {
            const m = this.organizers.find(o => o.entityName === this.modifiedEvent.organizer);
            if (m) {
              this.modifiedOrganizerEntityId = m.id;
            }
          }

          this.cdr.detectChanges();
        },
        error: (err) => {
          console.error('Error loading organizer entities', err);
        }
      });
  }

  cancelModify(): void {
    this.modifying = false;
    this.modifiedEvent = {} as ContentModerationEvent;
    this.modifiedOrganizerEntityId = null;
    this.modifiedOrganizerUserId = null;
    this.modifiedCategoryId = null;
    this.cdr.detectChanges();
  }

  saveModifiedEvent(): void {
    this.errorMessage = '';
    const original = this.events.find(e => e.id === this.modifiedEvent.id);

    const title = (this.modifiedEvent.title ?? original?.title ?? '').trim();
    const eventDescription = (this.modifiedEvent.eventDescription ?? original?.eventDescription ?? '').trim();
    const place = (this.modifiedEvent.location ?? original?.location ?? '').trim();
    const eventDate = this.modifiedEvent.date ? new Date(`${this.modifiedEvent.date}T00:00:00`) : null;

    if (!this.modifiedOrganizerEntityId || !this.modifiedCategoryId) {
      this.errorMessage = 'Seleccione un organizador y una categoría válidos.';
      this.cdr.detectChanges();
      return;
    }

    if (!title || !eventDescription || !place || !eventDate || isNaN(eventDate.getTime()) || eventDate < new Date()) {
      this.errorMessage = 'Por favor complete título, descripción, lugar y fecha futura antes de guardar.';
      this.cdr.detectChanges();
      return;
    }

    const eventDatePayload = this.modifiedEvent.date ? `${this.modifiedEvent.date}T00:00:00` : '';

    const dto: EditEventDto = {
      OrganizerId: this.modifiedOrganizerUserId ?? 0,
      OrganizerEntityId: this.modifiedOrganizerEntityId,
      CategoryId: this.modifiedCategoryId,
      ApprovedState: this.modifiedEvent.approved ?? false,
      IdEvent: this.modifiedEvent.id,
      Title: title,
      EventDescription: eventDescription,
      Place: place,
      IsVirtual: this.modifiedEvent.isVirtual ?? false,
      EventDate: eventDatePayload,
    };

    const payload: EditEventPayload = { editEventDto: dto };

    this.http.put('http://localhost:5053/administrator/events', payload).subscribe({
      next: () => {
        const idx = this.events.findIndex((e) => e.id === this.modifiedEvent.id);
        if (idx !== -1) {
          const organizerName = this.organizers.find(o => o.id === this.modifiedOrganizerEntityId)?.entityName;
          const categoryName = this.categories.find(c => c.id === this.modifiedCategoryId)?.nameCategory;

          this.events[idx] = {
            ...this.events[idx],
            title: this.modifiedEvent.title,
            date: this.modifiedEvent.date,
            location: this.modifiedEvent.location ?? this.events[idx].location,
            category: categoryName ?? this.modifiedEvent.category,
            organizer: organizerName ?? this.modifiedEvent.organizer,
            approved: this.modifiedEvent.approved,
            eventDescription: this.modifiedEvent.eventDescription,
            isVirtual: this.modifiedEvent.isVirtual,
          } as ContentModerationEvent;
        }

        this.cancelModify();
      },
      error: (err) => {
        this.errorMessage = this.getErrorMessage(err, 'No se pudo guardar el evento.');
        this.cdr.detectChanges();
      }
    });
  }
}

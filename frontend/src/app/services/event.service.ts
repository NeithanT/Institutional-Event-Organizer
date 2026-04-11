import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface EventSummaryDto {
  id: number;
  title: string;
  place: string;
  eventDate: string;
  category: string;
  organizerEntity: string;
  availableEntries: number;
  isVirtual: boolean;
  imageFileEvent: string | null;
}

export interface EventDetailDto {
  id: number;
  title: string;
  place: string;
  eventDate: string;
  eventDescription: string;
  category: string;
  organizerEntity: string;
  organizerName: string;
  availableEntries: number;
  isVirtual: boolean;
  imageFileEvent: string | null;
  isCanceled: boolean;
  cancelReason: string | null;
}

export interface EventFilters {
  category?: string;
  modality?: string;
  organizerEntity?: string;
  date?: string;
}

export const BACKEND_BASE = '/api';

@Injectable({ providedIn: 'root' })
export class EventService {
  private base = `${BACKEND_BASE}`;

  /** Convierte una ruta relativa del backend (/uploads/...) en URL absoluta */
  imageUrl(path: string | null | undefined): string {
    if (!path) return `${BACKEND_BASE}/images/default.jpg`;
    if (path.startsWith('http')) return path;
    return `${BACKEND_BASE}${path}`;
  }

  constructor(private http: HttpClient) {}

  getEvents(filters: EventFilters = {}): Observable<EventSummaryDto[]> {
    let params = new HttpParams();
    if (filters.category)        params = params.set('category', filters.category);
    if (filters.modality)        params = params.set('modality', filters.modality);
    if (filters.organizerEntity) params = params.set('organizerEntity', filters.organizerEntity);
    if (filters.date)            params = params.set('date', filters.date);
    return this.http.get<EventSummaryDto[]>(`${this.base}/events`, { params });
  }

  getEvent(id: number): Observable<EventDetailDto> {
    return this.http.get<EventDetailDto>(`${this.base}/events/${id}`);
  }
}

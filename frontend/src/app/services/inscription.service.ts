import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BACKEND_BASE } from './event.service';

export interface InscriptionSummaryDto {
  eventId: number;
  title: string;
  place: string;
  eventDate: string;
  category: string;
  organizerEntity: string;
  isVirtual: boolean;
  imageFileEvent: string | null;
  isPast: boolean;
}

@Injectable({ providedIn: 'root' })
export class InscriptionService {
  private base = BACKEND_BASE;

  constructor(private http: HttpClient) {}

  getInscriptions(userId: number): Observable<InscriptionSummaryDto[]> {
    return this.http.get<InscriptionSummaryDto[]>(`${this.base}/inscripciones?userId=${userId}`);
  }

  inscribe(eventId: number, userId: number): Observable<any> {
    return this.http.post(`${this.base}/inscripciones`, { eventId, userId });
  }

  unsubscribe(eventId: number, userId: number): Observable<any> {
    return this.http.delete(`${this.base}/inscripciones/${eventId}?userId=${userId}`);
  }
}

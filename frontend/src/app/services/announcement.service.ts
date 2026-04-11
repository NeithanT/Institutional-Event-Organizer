import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface AnnouncementSummaryDto {
  id: number;
  title: string;
  about: string;
  writerName: string;
  eventTitle: string | null;
  publicationDate: string;
}

export interface AnnouncementDetailDto {
  id: number;
  title: string;
  about: string;
  body: string;
  writerName: string;
  eventTitle: string | null;
}

@Injectable({ providedIn: 'root' })
export class AnnouncementService {
  private base = '/api';

  constructor(private http: HttpClient) {}

  getAnnouncements(date?: string): Observable<AnnouncementSummaryDto[]> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.get<AnnouncementSummaryDto[]>(`${this.base}/anuncios`, { params });
  }

  getAnnouncement(id: number): Observable<AnnouncementDetailDto> {
    return this.http.get<AnnouncementDetailDto>(`${this.base}/anuncios/${id}`);
  }
}

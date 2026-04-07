import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { BACKEND_BASE } from './event.service';

export interface UserProfileDto {
  id: number;
  userName: string;
  email: string;
  idCard: number | null;
  biography: string | null;
  urlImageProfile: string | null;
  preferredLanguage: string | null;
  roleId: number;
}

export interface UpdateUserDto {
  preferredLanguage?: string;
  biography?: string;
  currentPassword?: string;
  newPassword?: string;
}

@Injectable({ providedIn: 'root' })
export class UserService {
  private base = BACKEND_BASE;

  constructor(private http: HttpClient) {}

  getUser(id: number): Observable<UserProfileDto> {
    return this.http.get<UserProfileDto>(`${this.base}/user/${id}`);
  }

  updateUser(id: number, dto: UpdateUserDto): Observable<UserProfileDto> {
    return this.http.put<UserProfileDto>(`${this.base}/user/customize/${id}`, dto);
  }

  uploadPhoto(id: number, file: File): Observable<{ urlImageProfile: string }> {
    const form = new FormData();
    form.append('photo', file);
    return this.http.post<{ urlImageProfile: string }>(`${this.base}/user/${id}/photo`, form);
  }

  /** Convierte ruta relativa del backend en URL absoluta */
  imageUrl(path: string | null | undefined): string {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${this.base}${path}`;
  }

  /** Convierte ruta de imagen de evento (con fallback al default del backend) */
  eventImageUrl(path: string | null | undefined): string {
    if (!path) return `${this.base}/images/default.jpg`;
    if (path.startsWith('http')) return path;
    return `${this.base}${path}`;
  }
}

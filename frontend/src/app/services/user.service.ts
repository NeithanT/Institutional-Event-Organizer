import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

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
  private base = 'http://localhost:5053';

  constructor(private http: HttpClient) {}

  getUser(id: number): Observable<UserProfileDto> {
    return this.http.get<UserProfileDto>(`${this.base}/user/${id}`);
  }

  updateUser(id: number, dto: UpdateUserDto): Observable<UserProfileDto> {
    return this.http.put<UserProfileDto>(`${this.base}/user/customize/${id}`, dto);
  }
}

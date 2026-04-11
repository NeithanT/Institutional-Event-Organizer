import { ChangeDetectorRef, Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

interface UserSearchResult {
  id: number;
  userName: string;
  email: string;
  role: string;
  eventsCreated: number;
  active: boolean;
  idCard: number;
}

@Component({
  selector: 'app-organizer-management-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './organizer-management-admin.html',
  styleUrl: './organizer-management-admin.css',
})
export class OrganizerManagementAdmin implements OnInit {
  ref: ChangeDetectorRef = inject(ChangeDetectorRef);
  currentOrganizers: UserSearchResult[] = [];
  students: UserSearchResult[] = [];
  organizerPage = 0;
  organizerPageSize = 10;

  searchName = '';
  searchIdCard = '';
  searchedUser: UserSearchResult | null = null;
  isSearching = false;
  isUpdating = false;
  errorMessage = '';
  successMessage = '';

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadCurrentUsers();
  }

  get canPromote(): boolean {
    return !!this.searchedUser && this.searchedUser.active && this.searchedUser.role !== 'Organizer';
  }

  get canDemote(): boolean {
    return !!this.searchedUser && this.searchedUser.active && this.searchedUser.role === 'Organizer';
  }

  get canActivate(): boolean {
    return !!this.searchedUser && !this.searchedUser.active;
  }

  get canDeactivate(): boolean {
    return !!this.searchedUser && this.searchedUser.active;
  }

  get displayedOrganizers(): UserSearchResult[] {
    const start = this.organizerPage * this.organizerPageSize;
    return this.currentOrganizers.slice(start, start + this.organizerPageSize);
  }

  get organizerPageCount(): number {
    return Math.max(1, Math.ceil(this.currentOrganizers.length / this.organizerPageSize));
  }

  get hasMoreOrganizerPages(): boolean {
    return this.organizerPageCount > 1;
  }

  clearMessages(): void {
    this.errorMessage = '';
    this.successMessage = '';
  }

  loadCurrentUsers(): void {
    this.clearMessages();
    this.http
      .get<{ organizers: UserSearchResult[]; students: UserSearchResult[] }>('/api/administrator/users/grouped')
      .subscribe({
        next: (data) => {
          this.currentOrganizers = data.organizers;
          this.students = data.students;
          this.organizerPage = 0;
          this.ref.markForCheck();
        },
        error: (error) => {
          this.errorMessage = error?.error || 'No se pudo obtener la lista de usuarios.';
        },
      });
  }

  searchByName(): void {
    this.clearMessages();

    if (!this.searchName.trim()) {
      this.errorMessage = 'Ingrese un nombre de usuario para buscar.';
      return;
    }

    this.isSearching = true;
    this.searchedUser = null;

    this.http
      .get<UserSearchResult>(`/api/administrator/search-user-by-name/${encodeURIComponent(this.searchName.trim())}`)
      .subscribe({
        next: (user) => {
          this.searchedUser = user;
        },
        error: (error) => {
          this.errorMessage = error?.error || 'No se encontró ningún usuario con ese nombre.';
        },
        complete: () => {
          this.isSearching = false;
        },
      });
  }

  searchByIdCard(): void {
    this.clearMessages();

    const idCard = Number(this.searchIdCard);
    if (!Number.isInteger(idCard) || idCard <= 0) {
      this.errorMessage = 'Ingrese un número de cédula válido.';
      return;
    }

    this.isSearching = true;
    this.searchedUser = null;

    this.http
      .get<UserSearchResult>(`/api/administrator/search-user-by-idcard/${idCard}`)
      .subscribe({
        next: (user) => {
          this.searchedUser = user;
        },
        error: (error) => {
          this.errorMessage = error?.error || 'No se encontró ningún usuario con esa cédula.';
        },
        complete: () => {
          this.isSearching = false;
        },
      });
  }

  setOrganizer(): void {
    if (!this.searchedUser) {
      return;
    }

    this.clearMessages();
    this.isUpdating = true;

    this.http
      .post(`/api/administrator/change-rol/to-organizer/${this.searchedUser.id}`, {})
      .subscribe({
        next: () => {
          this.successMessage = 'El usuario ha sido promovido a organizador.';
          this.searchedUser!.role = 'Organizer';
          this.loadCurrentUsers();
        },
        error: (error) => {
          this.errorMessage = error?.error || 'No se pudo promover al usuario.';
        },
        complete: () => {
          this.isUpdating = false;
        },
      });
  }

  removeOrganizer(): void {
    if (!this.searchedUser) {
      return;
    }

    this.clearMessages();
    this.isUpdating = true;

    this.http
      .post(`/api/administrator/change-rol/to-student/${this.searchedUser.id}`, {})
      .subscribe({
        next: () => {
          this.successMessage = 'El organizador ha sido removido y ahora es estudiante.';
          this.searchedUser!.role = 'Student';
          this.loadCurrentUsers();
        },
        error: (error) => {
          this.errorMessage = error?.error || 'No se pudo remover el rol de organizador.';
        },
        complete: () => {
          this.isUpdating = false;
        },
      });
  }

  activateUser(): void {
    if (!this.searchedUser) {
      return;
    }

    this.clearMessages();
    this.isUpdating = true;

    this.http
      .post(`/api/administrator/set-active/${this.searchedUser.id}`, {})
      .subscribe({
        next: () => {
          this.successMessage = 'El usuario ha sido activado.';
          this.searchedUser!.active = true;
          this.loadCurrentUsers();
        },
        error: (error) => {
          this.errorMessage = error?.error || 'No se pudo activar el usuario.';
        },
        complete: () => {
          this.isUpdating = false;
        },
      });
  }

  deactivateUser(): void {
    if (!this.searchedUser) {
      return;
    }

    this.clearMessages();
    this.isUpdating = true;

    this.http
      .post(`/api/administrator/set-inactive/${this.searchedUser.id}`, {})
      .subscribe({
        next: () => {
          this.successMessage = 'El usuario ha sido desactivado.';
          this.searchedUser!.active = false;
          this.loadCurrentUsers();
        },
        error: (error) => {
          this.errorMessage = error?.error || 'No se pudo desactivar el usuario.';
        },
        complete: () => {
          this.isUpdating = false;
        },
      });
  }

  previousOrganizerPage(): void {
    if (this.organizerPage > 0) {
      this.organizerPage -= 1;
    }
  }

  nextOrganizerPage(): void {
    if (this.organizerPage + 1 < this.organizerPageCount) {
      this.organizerPage += 1;
    }
  }
}

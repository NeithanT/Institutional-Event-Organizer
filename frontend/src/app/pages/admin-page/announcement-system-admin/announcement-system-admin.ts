import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Authentication } from '../../../services/authentication';

interface AnnouncementForm {
  title: string;
  about: string;
  content: string;
}

@Component({
  selector: 'app-announcement-system-admin',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './announcement-system-admin.html',
  styleUrl: './announcement-system-admin.css',
})
export class AnnouncementSystemAdmin {
  ref: ChangeDetectorRef = inject(ChangeDetectorRef);
  showModal = false;
  modalSuccess = true;
  modalTitle = '';
  modalMessage = '';

  form: AnnouncementForm = {
    title: '',
    about: '',
    content: '',
  };

  constructor(private http: HttpClient, private auth: Authentication) {}

  closeModal(): void {
    this.showModal = false;
    this.ref.markForCheck();
  }

  submitAnnouncement(): void {
    const writerId = this.auth.userId;
    if (!writerId) {
      console.error('No authenticated writer ID found');
      return;
    }

    const payload = {
      writerId,
      title: this.form.title,
      about: this.form.about,
      body: this.form.content,
    };

    this.http.post('http://localhost:5053/administrator/announcements', payload)
      .subscribe({
        next: () => {
          this.form = { title: '', about: '', content: '' };
          this.modalSuccess = true;
          this.modalTitle = '¡Éxito!';
          this.modalMessage = 'El anuncio fue publicado correctamente.';
          this.showModal = true;
          this.ref.markForCheck();
        },
        error: () => {
          this.modalSuccess = false;
          this.modalTitle = '¡Error!';
          this.modalMessage = 'No se pudo enviar el anuncio. Intente nuevamente.';
          this.showModal = true;
          this.ref.markForCheck();
        }
      });

  }
}

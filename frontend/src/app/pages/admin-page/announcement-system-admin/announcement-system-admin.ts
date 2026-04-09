import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { HttpClient, HttpClientModule } from '@angular/common/http';
import { Authentication } from '../../../services/authentication';

interface AnnouncementForm {
  title: string;
  about: string;
  content: string;
}

@Component({
  selector: 'app-announcement-system-admin',
  standalone: true,
  imports: [CommonModule, FormsModule, HttpClientModule],
  templateUrl: './announcement-system-admin.html',
  styleUrl: './announcement-system-admin.css',
})
export class AnnouncementSystemAdmin {
  ref: ChangeDetectorRef = inject(ChangeDetectorRef);
  sent = false;
  error = false;

  form: AnnouncementForm = {
    title: '',
    about: '',
    content: '',
  };

  constructor(private http: HttpClient, private auth: Authentication) {}

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
          this.sent = true;
          this.error = false;
          this.form = {
            title: '',
            about: 'General',
            content: '',
          };
          this.ref.markForCheck();
        },
        error: (error) => {
          console.error('Unable to send announcement', error);
          this.sent = false;
          this.error = true;
          this.ref.markForCheck();
        }
      });

  }
}

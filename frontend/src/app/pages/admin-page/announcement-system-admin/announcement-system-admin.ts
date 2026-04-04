import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

interface AnnouncementForm {
  title: string;
  category: string;
  audience: string;
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
  sent = false;

  form: AnnouncementForm = {
    title: '',
    category: 'General',
    audience: 'Comunidad universitaria',
    content: '',
  };

  submitAnnouncement(): void {
    this.sent = true;
  }
}

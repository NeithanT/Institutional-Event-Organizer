import { Component, signal, computed, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { AnnouncementService } from '../../services/announcement.service';

interface AnnouncementItem {
  id: number;
  title: string;
  date: string;
}

@Component({
  selector: 'app-announcements-page',
  standalone: true,
  imports: [Navbar, Footer, RouterLink, FormsModule],
  templateUrl: './announcements-page.html',
  styleUrl: './announcements-page.css'
})
export class AnnouncementsPage implements OnInit {

  currentPage = signal(1);
  itemsPerPage = 10;
  filterFecha = signal('');
  selectedDate = '';

  allAnnouncements = signal<AnnouncementItem[]>([]);

  constructor(private announcementService: AnnouncementService) {}

  ngOnInit() {
    this.loadAnnouncements();
  }

  private loadAnnouncements() {
    this.currentPage.set(1);
    const date = this.filterFecha() ? this.filterFecha().split('T')[0] : undefined;

    this.announcementService.getAnnouncements(date).subscribe({
      next: dtos => {
        this.allAnnouncements.set(dtos.map(dto => ({
          id:    dto.id,
          title: dto.title,
          date:  dto.eventDate || '',
        })));
      }
    });
  }

  totalPages = computed(() =>
    Math.max(1, Math.ceil(this.allAnnouncements().length / this.itemsPerPage))
  );

  pagedAnnouncements = computed(() => {
    const start = (this.currentPage() - 1) * this.itemsPerPage;
    return this.allAnnouncements().slice(start, start + this.itemsPerPage);
  });

  onDateChange(value: string) {
    this.filterFecha.set(value);
    this.loadAnnouncements();
  }

  clearDate() {
    this.selectedDate = '';
    this.filterFecha.set('');
    this.loadAnnouncements();
  }

  formatFecha(date: string): string {
    if (!date) return '';
    return new Date(date).toLocaleDateString('es-CR', { day: 'numeric', month: 'long', year: 'numeric' });
  }

  prevPage() { if (this.currentPage() > 1) this.currentPage.update(p => p - 1); }
  nextPage() { if (this.currentPage() < this.totalPages()) this.currentPage.update(p => p + 1); }
}

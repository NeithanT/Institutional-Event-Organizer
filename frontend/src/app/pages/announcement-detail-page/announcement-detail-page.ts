import { Component, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { AnnouncementService } from '../../services/announcement.service';

interface AnnouncementDetail {
  id: number;
  title: string;
  content: string;
  organizer: string;
}

@Component({
  selector: 'app-announcement-detail-page',
  standalone: true,
  imports: [Navbar, Footer, RouterLink],
  templateUrl: './announcement-detail-page.html',
  styleUrl: './announcement-detail-page.css'
})
export class AnnouncementDetailPage implements OnInit {

  announcement = signal<AnnouncementDetail | null>(null);

  constructor(
    private route: ActivatedRoute,
    private announcementService: AnnouncementService
  ) {}

  ngOnInit() {
    const id = Number(this.route.snapshot.paramMap.get('id'));
    this.announcementService.getAnnouncement(id).subscribe({
      next: dto => {
        this.announcement.set({
          id:        dto.id,
          title:     dto.title,
          content:   dto.body,
          organizer: dto.writerName,
        });
      }
    });
  }

  getLines(content: string): string[] {
    return content.split('\n');
  }
}

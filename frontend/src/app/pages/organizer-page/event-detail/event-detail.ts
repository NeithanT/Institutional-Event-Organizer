import { Component, OnInit, ChangeDetectorRef } from '@angular/core'; 
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { Authentication } from '../../../services/authentication';
import { Sidebar } from '../../../components/sidebar/sidebar';

@Component({
  selector: 'app-event-detail',
  standalone: true,
  imports: [CommonModule, Sidebar],
  templateUrl: './event-detail.html',
  styleUrl: './event-detail.css'
})
export class EventDetail implements OnInit {

  eventId: number = 0;
  event: any = null;
  organizerId: number = 0;

  sidebarLinks = [
    { label: 'Crear Eventos', route: '/create-event' },
    { label: 'Mis Eventos', route: '/organizer-events' }
  ];

  constructor(
    private http: HttpClient,
    private route: ActivatedRoute,
    private auth: Authentication,
    private cdr: ChangeDetectorRef  
  ) {}

  ngOnInit() {
    this.organizerId = this.auth.userId;
    this.eventId = Number(this.route.snapshot.paramMap.get('id'));

    if (!this.organizerId || !this.eventId) {
      console.error("Faltan datos");
      return;
    }

    this.loadEvent();
  }

  loadEvent() {
    this.http.get<any>(
      `http://localhost:5053/organizer/my-events/${this.eventId}?organizerId=${this.organizerId}`
    )
    .subscribe({
      next: (data) => {
        console.log("EVENT:", data);
        this.event = { ...data };      
        this.cdr.detectChanges();    
      },
      error: (err) => console.error("ERROR:", err)
    });
  }

  getEventStatus(): string {
    if (!this.event) return '';
    const now = new Date();
    const eventDate = new Date(this.event.eventDate);
    if (!this.event.approvedState) return 'pending';
    if (eventDate > now) return 'approved';
    return 'finished';
  }
}
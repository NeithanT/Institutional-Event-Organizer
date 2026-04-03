import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EventDetailPage } from './event-detail-page';

describe('EventDetailPage', () => {
  let component: EventDetailPage;
  let fixture: ComponentFixture<EventDetailPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EventDetailPage],
    }).compileComponents();

    fixture = TestBed.createComponent(EventDetailPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

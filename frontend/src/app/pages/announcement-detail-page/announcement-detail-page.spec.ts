import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnouncementDetailPage } from './announcement-detail-page';

describe('AnnouncementDetailPage', () => {
  let component: AnnouncementDetailPage;
  let fixture: ComponentFixture<AnnouncementDetailPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnouncementDetailPage],
    }).compileComponents();

    fixture = TestBed.createComponent(AnnouncementDetailPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AnnouncementsPage } from './announcements-page';

describe('AnnouncementsPage', () => {
  let component: AnnouncementsPage;
  let fixture: ComponentFixture<AnnouncementsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AnnouncementsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(AnnouncementsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

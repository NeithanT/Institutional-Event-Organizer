import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InscriptionsPage } from './inscriptions-page';

describe('InscriptionsPage', () => {
  let component: InscriptionsPage;
  let fixture: ComponentFixture<InscriptionsPage>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InscriptionsPage],
    }).compileComponents();

    fixture = TestBed.createComponent(InscriptionsPage);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

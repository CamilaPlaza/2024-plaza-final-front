import { ComponentFixture, TestBed } from '@angular/core/testing';

import { InfoPointsComponent } from './info-points.component';

describe('InfoPointsComponent', () => {
  let component: InfoPointsComponent;
  let fixture: ComponentFixture<InfoPointsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [InfoPointsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(InfoPointsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

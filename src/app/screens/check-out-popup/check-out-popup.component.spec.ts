import { ComponentFixture, TestBed } from '@angular/core/testing';

import { CheckOutPopupComponent } from './check-out-popup.component';

describe('CheckOutPopupComponent', () => {
  let component: CheckOutPopupComponent;
  let fixture: ComponentFixture<CheckOutPopupComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [CheckOutPopupComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(CheckOutPopupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AlertStockComponent } from './alert-stock.component';

describe('AlertStockComponent', () => {
  let component: AlertStockComponent;
  let fixture: ComponentFixture<AlertStockComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AlertStockComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AlertStockComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

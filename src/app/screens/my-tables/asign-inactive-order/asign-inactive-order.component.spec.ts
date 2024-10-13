import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AsignInactiveOrderComponent } from './asign-inactive-order.component';

describe('AsignInactiveOrderComponent', () => {
  let component: AsignInactiveOrderComponent;
  let fixture: ComponentFixture<AsignInactiveOrderComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AsignInactiveOrderComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AsignInactiveOrderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableBusyComponent } from './table-busy.component';

describe('TableBusyComponent', () => {
  let component: TableBusyComponent;
  let fixture: ComponentFixture<TableBusyComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableBusyComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableBusyComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

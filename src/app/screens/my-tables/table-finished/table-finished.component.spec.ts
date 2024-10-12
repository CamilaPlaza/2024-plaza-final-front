import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TableFinishedComponent } from './table-finished.component';

describe('TableFinishedComponent', () => {
  let component: TableFinishedComponent;
  let fixture: ComponentFixture<TableFinishedComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TableFinishedComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TableFinishedComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

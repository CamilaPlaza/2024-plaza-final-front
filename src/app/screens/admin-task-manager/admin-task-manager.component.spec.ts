import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AdminTaskManagerComponent } from './admin-task-manager.component';

describe('AdminTaskManagerComponent', () => {
  let component: AdminTaskManagerComponent;
  let fixture: ComponentFixture<AdminTaskManagerComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AdminTaskManagerComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AdminTaskManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

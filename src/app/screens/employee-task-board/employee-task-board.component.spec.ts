import { ComponentFixture, TestBed } from '@angular/core/testing';

import { EmployeeTaskBoardComponent } from './employee-task-board.component';

describe('EmployeeTaskBoardComponent', () => {
  let component: EmployeeTaskBoardComponent;
  let fixture: ComponentFixture<EmployeeTaskBoardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [EmployeeTaskBoardComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(EmployeeTaskBoardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

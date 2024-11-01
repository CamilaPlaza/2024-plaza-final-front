import { Component, OnInit } from '@angular/core';
import { Goal } from 'src/app/models/goal';
import { CalendarMonthChangeEvent, CalendarYearChangeEvent } from 'primeng/calendar';

@Component({
  selector: 'app-goals',
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.css']
})
export class GoalsComponent implements OnInit {
  goals: Goal[] = [
    new Goal('Learn TypeScript', 'Complete the TypeScript course on Udemy', 80, 'blue', 'pi pi-graduation-cap', 1),
    new Goal('Read Books', 'Read 12 books this year', 50, 'orange', 'pi pi-book', 3),
    new Goal('Get Fit', 'Exercise at least 4 times a week', 20, 'red', 'pi pi-dumbbell', 4),
    new Goal('Travel', 'Visit 3 new countries this year', 30, 'purple', 'pi pi-plane', 5)
  ];
  
  selectedDate: Date = new Date();  

  constructor() { }

  ngOnInit(): void { }

  addNewGoal(): void {
    console.log('Adding new goal');
  }

  progressWidth(progress: number) {
    return progress / this.goals.length;
  }

  onMonthChange(event: CalendarMonthChangeEvent): void {
    const month = event.month;
    const year = event.year;

    if (month !== undefined && year !== undefined) {
      this.setLastDayOfMonth(month, year);
    }
  }

  onYearChange(event: CalendarYearChangeEvent): void {
    const year = event.year;

    if (year !== undefined) {
      this.setLastDayOfMonth(this.selectedDate.getMonth() + 1, year);
    }
  }

  setLastDayOfMonth(month: number, year: number): void {
    this.selectedDate = new Date(year, month, 0);
  }
}

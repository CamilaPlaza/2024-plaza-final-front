import { Component, OnInit } from '@angular/core';
import { Goal } from 'src/app/models/goal';
import { CalendarMonthChangeEvent, CalendarYearChangeEvent } from 'primeng/calendar';
import { ChartModule } from 'primeng/chart';

@Component({
  selector: 'app-goals',
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.css']
})
export class GoalsComponent implements OnInit {
  goals: Goal[] = [
    new Goal('Learn TypeScript', 'Complete the TypeScript course on Udemy', 100, 80, 'blue', 'pi pi-graduation-cap', '01/11/2024', 1),
    new Goal('Read Books', 'Read 12 books this year  at least please', 100, 50, 'orange', 'pi pi-book', '01/11/2024', 3),
    new Goal('Get Fit', 'Exercise at least 4 times a week', 50, 30, 'red', 'pi pi-gym', '01/11/2024', 4),
    new Goal('Travel', 'Visit 3 new countries this year', 80, 20, 'purple', 'pi pi-plane', '01/11/2024', 5),
    new Goal('Learn Love', 'Complete the TypeScript course on Udemy', 100, 15, 'blue', 'pi pi-love', '01/11/2024', 1)
  ];
  totalProgress: number = 0;
  visibleGoals: Goal[] = [];
  currentIndex: number = 0;
  itemsPerPage: number = 4;
  selectedDate: Date = new Date();  
  data: any;
  options: any;
  colors: string[] = ['#7f522e', '#b37a3a'];
  displayDialog: boolean = false;

  constructor() { 
    this.visibleGoals = this.goals.slice(0, 4);
  }

  ngOnInit(): void {
    this.calculateProgressValues();
    this.totalProgress = this.goals.reduce((acc, item) => acc + item.actualIncome, 0);
    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');
    this.data = {
      labels: this.goals.map(goal => goal.title),
      datasets: [
          {
              label: '% Progress',
              backgroundColor: this.goals.map(goal => goal.color),
              borderColor: this.goals.map(goal => goal.color), 
              data: this.goals.map(goal => (goal.actualIncome/goal.expectedIncome)*100)
          }
      ]
    };

    this.options = {
      indexAxis: 'y',
      maintainAspectRatio: false,
      aspectRatio: 1.2,
      plugins: {
          legend: {
              labels: {
                  color: textColor
              }
          }
      },
      scales: {
          x: {
              max: 100,
              ticks: {
                  color: textColorSecondary,
                  font: {
                      weight: 500
                  }
              },
              grid: {
                  color: surfaceBorder,
                  drawBorder: false
              }
          },
          y: {
              ticks: {
                  color: textColorSecondary
              },
              grid: {
                  color: surfaceBorder,
                  drawBorder: false
              }
          }
      }
    };
  }

  calculateProgressValues() {
    this.goals.forEach(goal => {
      goal.progressValue = (goal.actualIncome/goal.expectedIncome)*100; 
    });
  }



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

  
  updateVisibleCategories(): void {
    this.visibleGoals = this.goals.slice(this.currentIndex, this.currentIndex + this.itemsPerPage);
  }

  nextPage(): void {
    if (this.currentIndex + this.itemsPerPage < this.goals.length) {
      this.currentIndex++;
      this.updateVisibleCategories();
    }
  }

  prevPage(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateVisibleCategories();
    }
  }

  getDaysRemainingInMonth(): number {
    const today = new Date();
    const lastDayOfMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    return (lastDayOfMonth.getDate() - today.getDate());
  }

  getProgressColor(): string {
    const today = new Date();
    const dayOfMonth = today.getDate();
    const totalExpectedIncome = this.goals.reduce((acc, item) => acc + item.expectedIncome, 0);
    const progress = (this.totalProgress/totalExpectedIncome)*100;

  
    if (dayOfMonth >= 1 && dayOfMonth <= 10) {
      return 'green'; // Siempre verde entre el día 1 y 10
    } else if (dayOfMonth >= 11 && dayOfMonth <= 20) {
      // Lógica entre el día 11 y 20
      if (progress > 40) {
        return 'green';
      } else if (progress > 20) {
        return 'orange';
      } else {
        return 'red';
      }
    } else {
      // Lógica entre el día 21 y el último día del mes
      if (progress > 80) {
        return 'green';
      } else if (progress > 50) {
        return 'orange';
      } else {
        return 'red';
      }
    }
  }
  
  openDialog() {
    this.displayDialog = true;
  }

  onGoalAdded(newGoal: any) {
    this.goals.push(newGoal);
    this.displayDialog = false;
  }
  

}

import { Component, OnInit, HostListener } from '@angular/core';
import { Goal } from 'src/app/models/goal';
import { CalendarMonthChangeEvent, CalendarYearChangeEvent } from 'primeng/calendar';
import { GoalService } from 'src/app/services/goal_service';
import { finalize } from 'rxjs/operators';

@Component({
  selector: 'app-goals',
  templateUrl: './goals.component.html',
  styleUrls: ['./goals.component.css']
})
export class GoalsComponent implements OnInit {
  goals: Goal[] = [];
  totalProgress: number = 0;
  visibleGoals: Goal[] = [];
  currentIndex: number = 0;
  itemsPerPage: number = 4;
  selectedDate: Date = new Date();
  data: any;
  options: any;
  isMobile: boolean = false;
  colors: string[] = ['#7f522e', '#b37a3a'];
  displayDialog: boolean = false;
  totalIncomeExpected: number = 0;

  loading: boolean = false;

  constructor(private goalService: GoalService) {
    this.checkIfMobile();
  }

  ngOnInit(): void {
    const date = new Date();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = String(date.getFullYear()).slice(-2);
    this.getGoals(month, year);
  }

  @HostListener('window:resize', ['$event'])
  onResize(_: any) {
    this.checkIfMobile();
    this.updateVisibleGoals();
  }

  checkIfMobile() {
    this.isMobile = window.innerWidth <= 768;
  }

  updateVisibleGoals() {
    if (this.isMobile) {
      this.visibleGoals = this.goals;
      this.itemsPerPage = 1;
    } else {
      this.visibleGoals = this.goals.slice(0, 4);
      this.itemsPerPage = 4;
    }
  }

  private recalcTotalsAndChart() {
    this.totalProgress = this.goals.reduce((acc, g) => acc + (Number(g.actualIncome) || 0), 0);
    this.totalIncomeExpected = this.goals.reduce((acc, g) => acc + (Number(g.expectedIncome) || 0), 0);

    const documentStyle = getComputedStyle(document.documentElement);
    const textColor = documentStyle.getPropertyValue('--text-color');
    const textColorSecondary = documentStyle.getPropertyValue('--text-color');
    const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

    const safePct = (g: Goal) => {
      const exp = Number(g.expectedIncome) || 0;
      if (exp <= 0) return 0;
      const act = Number(g.actualIncome) || 0;
      return Math.min((act / exp) * 100, 100);
    };

    this.data = {
      labels: this.goals.map(goal => goal.title),
      datasets: [
        {
          label: '% Progress',
          backgroundColor: this.goals.map(goal => goal.color),
          borderColor: this.goals.map(goal => goal.color),
          data: this.goals.map(safePct)
        }
      ]
    };

    this.options = {
      indexAxis: 'y',
      maintainAspectRatio: false,
      aspectRatio: 1.2,
      plugins: {
        legend: { labels: { color: textColor } }
      },
      scales: {
        x: {
          max: 100,
          ticks: { color: textColorSecondary, font: { weight: 500 } },
          grid: { color: surfaceBorder, drawBorder: false }
        },
        y: {
          ticks: { color: textColorSecondary },
          grid: { color: surfaceBorder, drawBorder: false }
        }
      }
    };
  }

  getGoals(month: string, year: string) {
    this.loading = true;
    this.goalService.getGoals(month, year)
      .pipe(finalize(() => this.loading = false))
      .subscribe(
        (goals: Goal[]) => {
          this.goals = Array.isArray(goals) ? goals : [];
          this.updateVisibleGoals();
          this.calculateProgressValues();
          this.recalcTotalsAndChart();
        },
        (error) => {
          console.error('Error fetching goals:', error);
          this.goals = [];
          this.updateVisibleGoals();
          this.calculateProgressValues();
          this.recalcTotalsAndChart();
        }
      );
  }

  onDateChange(_: any){
    const month = String(this.selectedDate.getMonth() + 1).padStart(2, '0');
    const year = String(this.selectedDate.getFullYear()).slice(-2);
    this.getGoals(month, year);
  }

  calculateProgressValues() {
    this.goals.forEach(goal => {
      const exp = Number(goal.expectedIncome) || 0;
      const act = Number(goal.actualIncome) || 0;
      const progress = exp > 0 ? (act / exp) * 100 : 0;
      goal.progressValue = progress >= 100 ? 100 : parseFloat(progress.toFixed(2));
    });
  }

  progressWidth(progress: number) {
    return this.goals.length ? progress / this.goals.length : 0;
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

  // ====== NUEVO: helpers para la “days box” en base al mes seleccionado ======

  private isSameMonthYear(a: Date, b: Date): boolean {
    return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth();
  }

  private getSelectedMonthBounds() {
    const y = this.selectedDate.getFullYear();
    const m = this.selectedDate.getMonth(); // 0-based
    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);
    return { first, last, totalDays: last.getDate() };
  }

  getDaysBlockText(): string {
    const today = new Date();
    const { last, totalDays } = this.getSelectedMonthBounds();

    // Mes actual -> días restantes reales
    if (this.isSameMonthYear(this.selectedDate, today)) {
      const diff = Math.max(0, Math.ceil((last.getTime() - today.setHours(0,0,0,0)) / (1000 * 60 * 60 * 24)));
      const monthName = this.selectedDate.toLocaleString(undefined, { month: 'long' });
      return `${diff} days left in ${monthName}`;
    }

    // Mes futuro -> aún no empezó
    if (this.selectedDate > today) {
      const monthName = this.selectedDate.toLocaleString(undefined, { month: 'long' });
      return `${monthName} has ${totalDays} days`;
    }

    // Mes pasado -> ya terminó
    const monthName = this.selectedDate.toLocaleString(undefined, { month: 'long' });
    return `${monthName} ended (${totalDays} days)`;
  }

  getDaysBlockColor(): string {
    const today = new Date();
    if (this.isSameMonthYear(this.selectedDate, today)) {
      // usa el color dinámico según progreso solo en el mes actual
      return this.getProgressColor();
    }
    // neutro para pasado/futuro
    return '#9aa0a6'; // gris
  }

  // Color del progreso (solo lo usamos en el mes actual)
  getProgressColor(): string {
    const today = new Date();
    const dayOfMonth = today.getDate();
    const totalExpectedIncome = this.totalIncomeExpected || 0;
    const progress = totalExpectedIncome > 0 ? (this.totalProgress / totalExpectedIncome) * 100 : 0;

    if (dayOfMonth >= 1 && dayOfMonth <= 10) {
      return 'green';
    } else if (dayOfMonth >= 11 && dayOfMonth <= 20) {
      if (progress > 40) return 'green';
      if (progress > 20) return 'orange';
      return 'red';
    } else {
      if (progress > 80) return 'green';
      if (progress > 50) return 'orange';
      return 'red';
    }
  }

  openDialog() {
    this.displayDialog = true;
  }

  onGoalAdded(newGoal: Goal) {
    this.loading = true;
    this.goals.push(newGoal);
    this.updateVisibleGoals();
    this.calculateProgressValues();
    this.recalcTotalsAndChart();
    this.displayDialog = false;
    this.loading = false;
  }
}

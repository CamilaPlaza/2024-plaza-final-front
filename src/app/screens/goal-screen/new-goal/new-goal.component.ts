import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { Category } from 'src/app/models/category';
import { Goal } from 'src/app/models/goal';
import { CategoryService } from 'src/app/services/category_service';
import { GoalService } from 'src/app/services/goal_service';

@Component({
  selector: 'app-new-goal',
  templateUrl: './new-goal.component.html',
  styleUrl: './new-goal.component.css'
})
export class NewGoalComponent implements OnInit  {
  @Output() goalAdded = new EventEmitter<any>();

  selectedGoalType: string = '';
  selectedCategory: any;
  targetAmount!: number;
  goalColor: string = '#ffffff';
  selectedIcon: string= '';
  goalTitle: string = '';
  goalDescription: string = '';
  goalDeadline: Date = new Date();

  categories: Category[] = [];
  minDate: Date = new Date();
  isFormComplete: boolean = false;
  goals: Goal[] = [];

  icons = [
    { label: 'Briefcase', value: 'pi-briefcase' },
    { label: 'Bullseye', value: 'pi-bullseye' },
    { label: 'Check', value: 'pi-check' },
    { label: 'Clipboard', value: 'pi-clipboard' },
    { label: 'Dollar', value: 'pi-dollar' },
    { label: 'Money Bill', value: 'pi-money-bill' },
    { label: 'Paperclip', value: 'pi-paperclip' },
    { label: 'Receipt', value: 'pi-receipt' },
    { label: 'Star', value: 'pi-star' },
  ];

  hasFinalGainGoal: boolean = false;

  constructor(
    private categoryService: CategoryService,
    private goalService: GoalService
  ) {}

  ngOnInit() {
    this.loadCategories();
    const today = new Date();
    // minDate = primer día del próximo mes
    this.minDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    this.goalDeadline = this.minDate;
  }

  checkFormComplete() {
    this.isFormComplete = !!this.goalTitle && !!this.goalDeadline && !!this.goalDescription;
  }

  onDateChange(_: any) {
    // Recalcular opciones y chequeo de Final Gain
    this.loadCategories();

    // Si estaba en finalGain y ahora no se permite, limpiar selección
    if (this.selectedGoalType === 'finalGain' && this.hasFinalGainGoal) {
      this.selectedGoalType = '';
    }

    // Reset de category si cambia el mes
    this.selectedCategory = null;
  }

  async addTotalGainGoal() {
    const newGoal = new Goal(
      this.goalTitle,
      this.goalDescription,
      this.targetAmount,
      0,
      this.goalColor,
      'pi ' + this.selectedIcon,
      this.formatDeadline(this.goalDeadline),
      this.selectedCategory?.id ?? null // final gain -> null
    );

    const response = await this.goalService.createGoal(newGoal);
    if (response) {
      this.goalAdded.emit(newGoal);
    } else {
      console.error("Failed to create goal");
    }
  }

  async addCategoryGoal() {
    const newGoal = new Goal(
      this.goalTitle,
      this.goalDescription,
      this.targetAmount,
      0,
      this.goalColor,
      'pi ' + this.selectedIcon,
      this.formatDeadline(this.goalDeadline),
      this.selectedCategory?.id
    );

    const response = await this.goalService.createGoal(newGoal);
    if (response) {
      this.goalAdded.emit(newGoal);
    } else {
      console.error("Failed to create goal");
    }
  }

  addGoal() {
    if (this.selectedGoalType === 'category') {
      this.addCategoryGoal();
    } else {
      this.addTotalGainGoal();
    }

    // limpiar form
    this.selectedGoalType = '';
    this.selectedCategory = null;
    this.targetAmount = 0;
    this.goalColor = '#ffffff';
    this.selectedIcon = '';
    this.goalTitle = '';
    this.goalDescription = '';
    this.goalDeadline = new Date();
    this.checkFormComplete();
  }

  formatDeadline(date: Date): string {
    if (!date) return '';
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear().toString().slice(-2);
    return `${month}/${year}`;
  }

  selectGoalType(type: string) {
    // Extra guard por si intentan seleccionar finalGain con tooltip abierto
    if (type === 'finalGain' && this.hasFinalGainGoal) {
      this.selectedGoalType = '';
      return;
    }
    this.selectedGoalType = type;
  }

  loadCategories(): void {
    const month = (this.goalDeadline.getMonth() + 1).toString().padStart(2, '0');
    const year = this.goalDeadline.getFullYear().toString().slice(-2);

    this.goalService.getGoals(month, year).subscribe((goals: Goal[]) => {
      this.goals = Array.isArray(goals) ? goals : [];

      // Existe final gain si hay goal con categoryId === null
      this.hasFinalGainGoal = this.goals.some(goal => goal.categoryId === null);

      const categoryIdsWithGoals = this.goals
        .map(goal => goal.categoryId?.toString())
        .filter(v => !!v);

      this.categoryService.getCategories().subscribe({
        next: (categoryData) => {
          if (categoryData && Array.isArray(categoryData.categories)) {
            this.categories = categoryData.categories.filter(category =>
              !categoryIdsWithGoals.includes(category.id?.toString())
            );
          }
        },
        error: (err) => {
          console.error('Error loading categories:', err);
        }
      });
    });
  }

  onTargetAmountChange() {
    if (this.targetAmount == null || this.targetAmount <= 0) {
      this.targetAmount = 1;
    }
  }

  isFormValid(): boolean {
    return !!this.goalTitle && !!this.goalDeadline && !!this.goalDescription &&
           !!this.goalColor && !!this.selectedIcon &&
           this.targetAmount > 0 &&
           (
             (this.selectedGoalType === 'category' && !!this.selectedCategory) ||
             (this.selectedGoalType === 'finalGain' && !this.hasFinalGainGoal)
           );
  }

  getSelectedMonthLabel(): string {
    const monthName = this.goalDeadline.toLocaleString(undefined, { month: 'long' });
    const year = this.goalDeadline.getFullYear();
    return `${monthName} ${year}`;
  }
}

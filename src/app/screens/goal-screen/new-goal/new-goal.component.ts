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

  constructor(private categoryService: CategoryService, private goalService: GoalService){}

  ngOnInit() {
    this.loadCategories();
    const today = new Date();
    this.minDate = new Date(today.getFullYear(), today.getMonth() + 1, 1);
    this.goalDeadline = this.minDate;
  }

  checkFormComplete() {
    this.isFormComplete = !!this.goalTitle && !!this.goalDeadline && !!this.goalDescription;
  }

  onDateChange(event: any){
    this.loadCategories();
    this.selectedCategory = null;
  }

  async addTotalGainGoal() {
    const newGoal = new Goal(this.goalTitle, this.goalDescription, this.targetAmount, 0, this.goalColor, 'pi ' + this.selectedIcon, this.formatDeadline(this.goalDeadline), this.selectedCategory?.id ?? null);
    console.log(newGoal);
    const response = await this.goalService.createGoal(newGoal);

    if (response) {
        // Si la respuesta es válida, emitimos el evento
        this.goalAdded.emit(newGoal);
    } else {
        // Manejo de errores si la creación falla
        console.error("Failed to create goal");
        // Puedes agregar aquí lógica adicional si deseas mostrar un mensaje de error al usuario
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
        this.selectedCategory?.id // Usamos `?.` para evitar errores si no hay categoría seleccionada
    );
    console.log(newGoal);

    // Llamada al servicio para crear el objetivo
    const response = await this.goalService.createGoal(newGoal);

    if (response) {
        // Si la respuesta es válida, emitimos el evento
        this.goalAdded.emit(newGoal);
    } else {
        // Manejo de errores si la creación falla
        console.error("Failed to create goal");
        // Puedes agregar aquí lógica adicional si deseas mostrar un mensaje de error al usuario
    }
}

  addGoal(){
    if (this.selectedGoalType == 'category'){
      this.addCategoryGoal();
    }
    else{
      this.addTotalGainGoal();
    }
    this.selectedGoalType = '';
    this.selectedCategory = null;
    this.targetAmount = 0;
    this.goalColor = '#ffffff';
    this.selectedIcon = '';
    this.goalTitle = '';
    this.goalDescription = '';
    this.goalDeadline = new Date();

  }

  formatDeadline(date: Date): string {
    if (!date) return '';
    
    const month = ('0' + (date.getMonth() + 1)).slice(-2);
    const year = date.getFullYear().toString().slice(-2);
    
    return `${month}/${year}`;
  }
  

  selectGoalType(type: string) {
    this.selectedGoalType = type;
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        if (data && Array.isArray(data.categories)) {
          this.categories = data.categories.map(item => ({
            id: item.id,
            name: item.name,
            type: item.type
          }));
        }
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
      }
    });
  }

  onTargetAmountChange() {
    if (this.targetAmount <= 0 || this.targetAmount == null) {
      this.targetAmount = 1;
    }
 }


isFormValid(): boolean {
  return this.goalTitle && this.goalDeadline && this.goalDescription && this.goalColor && this.selectedIcon &&
         this.targetAmount > 0 &&
         ((this.selectedGoalType === 'category' && this.selectedCategory) || 
          this.selectedGoalType === 'finalGain');
}

}

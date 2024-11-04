import { Component, Output, EventEmitter, OnInit } from '@angular/core';
import { Category } from 'src/app/models/category';
import { Goal } from 'src/app/models/goal';
import { CategoryService } from 'src/app/services/category_service';


@Component({
  selector: 'app-new-goal',
  templateUrl: './new-goal.component.html',
  styleUrl: './new-goal.component.css'
})
export class NewGoalComponent implements OnInit  {
  @Output() goalAdded = new EventEmitter<any>();
  selectedGoalType: string = ''; // Valor inicial
  selectedCategory: any;
  targetAmount!: number;
  goalColor: string = '#ffffff';
  selectedIcon: string= '';
  goalTitle: string = '';
  goalDescription: string = '';
  goalDeadline: Date = new Date();
  categories: Category[] = [];
  minDate: Date = new Date();
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

  constructor(private categoryService: CategoryService){}

  ngOnInit() {
    this.loadCategories();
    const today = new Date();
    this.minDate = new Date(today.getFullYear(), today.getMonth(), 1);
  }

  addTotalGainGoal() {
    const newGoal = new Goal(this.goalTitle, this.goalDescription, this.targetAmount, 0, this.goalColor, 'pi ' + this.selectedIcon, this.formatDeadline(this.goalDeadline));
    console.log(newGoal);
    this.goalAdded.emit(newGoal);
  }

  addCategoryGoal(){
    const newGoal = new Goal(this.goalTitle, this.goalDescription, this.targetAmount, 0, this.goalColor, 'pi ' +  this.selectedIcon, this.formatDeadline(this.goalDeadline), this.selectedCategory.id);
    console.log(newGoal);
    this.goalAdded.emit(newGoal);
  }

  addGoal(){
    if (this.selectedGoalType == 'category'){
      this.addCategoryGoal();
    }
    else{
      this.addTotalGainGoal();
    }
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

}

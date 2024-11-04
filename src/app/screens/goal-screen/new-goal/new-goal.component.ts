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
  goalDeadline: string = '';
  categories: Category[] = [];

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
  }

  addTotalGainGoal() {
    const newGoal = new Goal(this.goalTitle, this.goalDescription, this.targetAmount, 0, this.goalColor, this.selectedIcon, this.goalDeadline);
    console.log(newGoal);
    this.goalAdded.emit(newGoal);
  }

  addCategoryGoal(){
    const newGoal = new Goal(this.goalTitle, this.goalDescription, this.targetAmount, 0, this.goalColor, this.selectedIcon, this.goalDeadline, this.selectedCategory);
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

import { Component, Output, EventEmitter } from '@angular/core';


@Component({
  selector: 'app-new-goal',
  templateUrl: './new-goal.component.html',
  styleUrl: './new-goal.component.css'
})
export class NewGoalComponent {
  @Output() goalAdded = new EventEmitter<any>();
  selectedGoalType: string = ''; // Valor inicial
  selectedCategory: any;
  targetAmount!: number;
  targetGainAmount!: number;
  goalColor: string = '';
  selectedIcon: string= '';
  goalTitle: string = '';
  goalDescription: string = '';
  goalDeadline: string = '';

  categories = [
    { label: 'Category 1', value: 'category1' },
    { label: 'Category 2', value: 'category2' },
    { label: 'Category 3', value: 'category3' },
    // Agrega más categorías según sea necesario
  ];

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

  addGoal() {
    const newGoal = {};
    this.goalAdded.emit(newGoal);
  }

  selectGoalType(type: string) {
    this.selectedGoalType = type;
  }

}

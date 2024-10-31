import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Goal } from 'src/app/models/goal';


@Component({
  selector: 'app-goals',
  templateUrl: './goals.component.html',
  styleUrl: './goals.component.css'
})
export class GoalsComponent  implements OnInit {
  goals: Goal[] = [
    new Goal('Learn TypeScript', 'Complete the TypeScript course on Udemy', 50, 'blue', 'pi pi-graduation-cap', 1),
    new Goal('Build a Website', 'Create a personal portfolio website', 20, 'green', 'pi pi-globe', 2),
    new Goal('Read Books', 'Read 12 books this year', 75, 'orange', 'pi pi-book', 3),
    new Goal('Get Fit', 'Exercise at least 4 times a week', 30, 'red', 'pi pi-dumbbell', 4),
    new Goal('Travel', 'Visit 3 new countries this year', 10, 'purple', 'pi pi-plane', 5)
];
  totalStorage = {
    used: 70,
    total: '100%'
  };

  waterGoals: Goal[] = [new Goal('Read Books', 'Read 12 books this year', 75, 'orange', 'pi pi-book', 3), 
    new Goal('Get Fit', 'Exercise at least 4 times a week', 30, 'red', 'pi pi-dumbbell', 4),
    new Goal('Travel', 'Visit 3 new countries this year', 10, 'purple', 'pi pi-plane', 5)
  ];

  menuItems: MenuItem[] = [
    {
      label: 'Add Goal',
      icon: 'pi pi-plus',
      command: () => {
        this.addNewGoal();
      }
    }
  ];

  constructor() { }

  ngOnInit(): void { }

  addNewGoal(): void {
    // Implementar lógica para agregar nuevo objetivo
    console.log('Adding new goal');
  }
}
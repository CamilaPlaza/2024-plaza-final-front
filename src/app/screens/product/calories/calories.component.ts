import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-calories',
  templateUrl: './calories.component.html',
  styleUrls: ['./calories.component.css']
})
export class CaloriesComponent implements OnInit {
  @Output() onClose = new EventEmitter<void>();
  @Output() onSave = new EventEmitter<void>();
  showPanel = true;
  showDropdown = false;
  selectedIngredient: any | null = null;

  availableIngredients = [
    { id: '1', name: 'Eggs', calories: 155 },
    { id: '2', name: 'Chicken Breast', calories: 165 },
    { id: '3', name: 'Broccoli', calories: 55 },
    { id: '4', name: 'Rice', calories: 130 },
    { id: '5', name: 'Almonds', calories: 576 },
    { id: '6', name: 'Banana', calories: 105 },
    { id: '7', name: 'Oatmeal', calories: 154 },
    { id: '8', name: 'Greek Yogurt', calories: 59 }
  ];

  ingredients: any[] = [];

  constructor() {}

  ngOnInit() {}

  toggleDropdown() {
    this.showDropdown = !this.showDropdown;
  }

  addIngredient() {
    if (this.selectedIngredient) {
      this.ingredients.push({ ...this.selectedIngredient });
      this.resetDropdown();
    }
  }

  cancelSelection() {
    this.resetDropdown();
  }

  resetDropdown() {
    this.selectedIngredient = null;
    this.showDropdown = false;
  }

  removeIngredient(id: string) {
    this.ingredients = this.ingredients.filter(ingredient => ingredient.id !== id);
  }

  getFilteredIngredients() {
    return this.availableIngredients.filter(ingredient =>
      !this.ingredients.some(selected => selected.id === ingredient.id)
    );
  }

  handleSave() {
    this.showPanel = false;
    setTimeout(() => {
      this.onSave.emit();
    }, 1000);
  }

  getTotalCalories() {
    return this.ingredients.reduce((total, ingredient) => total + ingredient.calories, 0);
  }
}

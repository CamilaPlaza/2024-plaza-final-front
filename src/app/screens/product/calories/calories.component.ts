import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';
import { CalorieService } from 'src/app/services/calorie_service';

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

  ingredients: any[] = [];
  availableIngredients: any[] = [];

  constructor(private calorieService: CalorieService) {}  // Inyecta el servicio

  ngOnInit() {
    this.loadCalories();  // Cargar las calorías al iniciar el componente
  }

  // Función para cargar las comidas desde el servicio
  loadCalories() {
    this.calorieService.getCalories().subscribe(response => {
      if (response && response.message && response.message.food) {
        this.availableIngredients = response.message.food.map((item: any) => ({
          name: item.name,
          id: item.id ? item.id.toString() : '',  // Manejo de undefined
          calories: item.calories_portion
        }));
        console.log(this.availableIngredients);  // Verifica los datos
      } else {
        console.error("No se encontraron alimentos en la respuesta.");
      }
    }, error => {
      console.error("Error al cargar las calorías: ", error);
    });
  }
  
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

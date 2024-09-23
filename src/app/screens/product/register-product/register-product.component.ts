import { Component, OnInit, HostListener } from '@angular/core';
import { Product } from 'src/app/models/product';
import { Router } from '@angular/router';
import { ProductService } from 'src/app/services/product_service';
import { Category } from 'src/app/models/category';

@Component({
  selector: 'app-register-product',
  templateUrl: './register-product.component.html',
  styleUrl: './register-product.component.css'
})
export class RegisterProductComponent implements OnInit{
  name: string = '';
  description: string = '';
  price: string = '';
  product: Product | undefined;
  displayConfirmDialog: boolean = false;
  displayErrorDialog: boolean = false;
  errorSubtitle: string = '';
  loading: boolean = false; 
  isMobile: boolean = false;

  categories = [ { label: 'Breakfast', value: new Category('Breakfast', 'Default', 1) },
  { label: 'Lunch', value: new Category('Lunch', 'Default', 2) },
  { label: 'Dinner', value: new Category('Dinner', 'Default', 3) },
  { label: 'Drinks', value: new Category('Drinks', 'Custom', 4) }];

  selectedCategories: Category[] = [];
  selectedCategoryIds: string = '';
  showCategoryPanel = false;
  showCaloriesPanel = false;
  calories?: number;

  constructor( private productService: ProductService, private router: Router) {}

  ngOnInit(): void {
    this.checkIfMobile();   
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.checkIfMobile();
  }

  checkIfMobile() {
    this.isMobile = window.innerWidth <= 600;
  }

  async onRegister() {
    this.closeConfirmDialog();
    this.loading = true;
    try {
      this.product = new Product(this.name, this.description, this.price, this.selectedCategoryIds);
      console.log('PRODUCT: ', this.product);
      const response = await this.productService.onRegister(this.product);

      if (response) {
        console.log('Register successful', response);
        this.router.navigate(['/products-view']);
      } else {
        this.errorSubtitle = 'An unexpected error occurred. Please try again.';
        this.showErrorDialog();
      }
    } catch (error: any) {
      this.errorSubtitle = 'An error occurred during registration.';
      this.showErrorDialog();
    } finally {
      this.loading = false;
    }
  }

  onCategoryChange(event: any): void {
    this.selectedCategories = event.value;
    this.selectedCategoryIds = this.selectedCategories.map(cat => cat.id).join(', ');
  }

  getSelectedCategoriesLabel(): string {
    return this.selectedCategories.length > 0 
      ? this.selectedCategories.map(cat => cat.name).join(', ')
      : 'Select categories'; 
  }

  logSelectedCategories() {
    console.log('Selected Categories: ', this.selectedCategories);
  }
  

  //POP UPS
  
  showConfirmDialog() {
    this.displayConfirmDialog = true;
  }

  closeConfirmDialog() {
    this.displayConfirmDialog = false;
  }

  showErrorDialog() {
    this.closeConfirmDialog();
    this.displayErrorDialog = true;
  }

  closeErrorDialog() {
    this.displayErrorDialog = false;
  }

  onPriceChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const value = parseFloat(input.value);
  
    if (value < 0) {
      input.value = '0'; // Establece el valor a 0 si es negativo
      this.price = '0'; // Asegúrate de actualizar el modelo ngModel
    } else {
      this.price = input.value; // Actualiza el modelo ngModel con el valor válido
    }
  }

  onlyAllowNumbers(event: KeyboardEvent) {
    const charCode = event.which ? event.which : event.keyCode;
    if (charCode > 31 && (charCode < 48 || charCode > 57)) {
      event.preventDefault();
    }
  }

  showCategories() {
    this.showCategoryPanel = true;
    this.showCaloriesPanel = false;
  }


  handleCategorySave() {
    this.showCategoryPanel = false;
  }

  handleCategoryClose() {
    this.showCategoryPanel = false;
  } 
  
  isFormValid(): boolean {
    return this.name !== '' && 
           this.description !== '' &&
           this.price !== '';
  }

  showCalories() {
    this.showCaloriesPanel = true;
    this.showCategoryPanel = false;
  }


  handleCaloriesSave() {
    this.showCaloriesPanel = false;
  }

  handleCaloriesClose() {
    this.showCaloriesPanel = false;
  } 

}

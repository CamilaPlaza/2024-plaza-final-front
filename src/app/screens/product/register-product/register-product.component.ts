import { Component, OnInit, HostListener } from '@angular/core';
import { Product } from 'src/app/models/product';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { ProductService } from 'src/app/services/product_service';

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

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  async onRegister() {
    this.closeConfirmDialog();
    this.loading = true;
    try {
      this.product = new Product(this.name, this.description, this.price);
      console.log(this.product);
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
      this.loading = false; // Ocultar el spinner cuando finaliza
    }
  }

  
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
  
  
}

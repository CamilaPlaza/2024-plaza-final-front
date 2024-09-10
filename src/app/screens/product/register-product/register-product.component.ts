import { Component, OnInit, HostListener } from '@angular/core';
import { Product } from 'src/app/models/product';
import { ConfirmationService } from 'primeng/api';
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
  product: Product | undefined

  constructor(
    private productService: ProductService,
    private router: Router
  ) {}

  ngOnInit(): void {}

  async onRegister() {
    try {
      // Crear el objeto Product basado en los campos del formulario
      this.product = new Product(this.name, this.description, this.price);
      console.log(this.product);

      // Llamar al servicio para registrar el producto
      const response = await this.productService.onRegister(this.product);
      console.log('Register successful', response);
      
      // Redirigir a la vista de productos si el registro es exitoso
      if (response === "true") {
        this.router.navigate(['/products-view']);
      } else {
        console.error('Error during product registration');
      }
    } catch (error: any) {
      console.error('Register failed', error);
    }
  }
}

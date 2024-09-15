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
  product: Product | undefined

  constructor(private confirmationService: ConfirmationService,
    private productService: ProductService,
    private router: Router,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {}

  async onRegister() {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to register this product?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          this.product = new Product(this.name, this.description, this.price);
          console.log(this.product);
          const response = await this.productService.onRegister(this.product);
          if(response){
            console.log('Register successful', response);
            this.messageService.add({ severity: 'info', summary: 'Success', detail: 'Product registered successfully', life: 3000});
            this.router.navigate(['/products-view']);
          }else{
            this.messageService.add({ severity: 'info', summary: 'Fail', detail: 'An error occurred',life: 3000 });
          }
        } catch (error: any) {
          console.error('Register failed', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occurred during registration', life: 3000 });
        }
      },
      reject: () => {
        this.messageService.add({ severity: 'secondary', summary: 'Rejected', detail: 'You have rejected the registration', life: 3000 });
      }
    });
  }
  
}

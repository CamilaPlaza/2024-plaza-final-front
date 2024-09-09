import { Component, OnInit, HostListener } from '@angular/core';
import { Product } from 'src/app/models/product';
import { ConfirmationService } from 'primeng/api';
import { Router } from '@angular/router';

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
    private router: Router){}

  ngOnInit(): void {}

  registerProduct(){
    this.product = new Product(this.name, this.description, this.price);
    console.log('producto bro', this.product);
  }

  async onRegister() {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to proceed?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          console.log('Register successful');
          this.router.navigate(['/products-view']);
    
        } catch (error: any) {
          console.error('Register failed', error);
        }
      }
    });
  }
 

}

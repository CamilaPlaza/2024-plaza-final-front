import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/models/product';

@Component({
  selector: 'app-register-product',
  templateUrl: './register-product.component.html',
  styleUrl: './register-product.component.css'
})
export class RegisterProductComponent implements OnInit{
  name: string = '';
  description: string = '';
  price: string = '';
  amount: string = '';
  product: Product | undefined

  ngOnInit(): void {}

  registerProduct(){
    this.product = new Product(this.name, this.description, this.price, this.amount);
    console.log('producto bro', this.product);
    
  }

}

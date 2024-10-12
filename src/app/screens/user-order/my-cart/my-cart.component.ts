import { Component, Input } from '@angular/core';
import { OrderItem } from 'src/app/models/orderItem';

@Component({
  selector: 'app-my-cart',
  templateUrl: './my-cart.component.html',
  styleUrl: './my-cart.component.css'
})
export class MyCartComponent {
  @Input() orderItems: OrderItem[] = [];
  @Input() isVisible: boolean = false;

  getTotalPrice(): number {
    return this.orderItems.reduce((total, item) => total + item.amount * parseFloat(item.product_price), 0);
  }

  closeCart(): void {
    this.isVisible = false;
  }

}

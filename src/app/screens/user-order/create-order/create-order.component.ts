import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Order } from 'src/app/models/order';


@Component({
  selector: 'app-create-order',
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.css']
})
export class CreateOrderComponent {
  @Input() isVisible: boolean = false;
  @Output() orderCreated = new EventEmitter<Order>(); 
  @Output() closeModal = new EventEmitter(); 
  amountOfPeople: number = 1; 

  createOrder() {
    const newOrder: Order = {
      status: 'New',
      amountOfPeople: this.amountOfPeople,
      tableNumber: 1, 
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(), 
      total: '0.00', 
      orderItems: [] 
    };
    this.orderCreated.emit(newOrder);
    this.isVisible = false; 
  }

  closeDialog(){
    this.closeModal.emit();
  }

}

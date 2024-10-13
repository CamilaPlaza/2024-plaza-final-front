import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Order } from 'src/app/models/order';
import { OrderItem } from 'src/app/models/orderItem';
import { OrderService } from 'src/app/services/order_service';


@Component({
  selector: 'app-create-order',
  templateUrl: './create-order.component.html',
  styleUrls: ['./create-order.component.css']
})
export class CreateOrderComponent {
  @Input() isVisible: boolean = false;
  @Output() orderCreated = new EventEmitter<Order>(); 
  @Output() closeModal = new EventEmitter(); 
  @Input() orderItems: OrderItem[] = [];
  @Input() total: number = 1;
  amountOfPeople: number = 1; 

  constructor(private orderService: OrderService) { } 

  async createOrder() {
    const newOrder: Order = {
      status: 'INACTIVE',
      amountOfPeople: this.amountOfPeople,
      tableNumber: 0, 
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString(), 
      total: this.total.toString(), 
      orderItems: this.orderItems
    };
    
    console.log(newOrder);
    try {
      await this.orderService.onRegister(newOrder);
      console.log('Orden registrada exitosamente');
    } catch (error) {
      console.error('Error al crear la orden:', error);
      // Manejo de errores según sea necesario
    }
  
    this.closeDialog();
  }

  closeDialog(){
    this.closeModal.emit();
  }

}

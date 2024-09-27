import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Order } from 'src/app/models/order';
import { OrderItem } from 'src/app/models/orderItem';

@Component({
  selector: 'app-table-free',
  templateUrl: './table-free.component.html',
  styleUrls: ['./table-free.component.css']
})
export class TableFreeComponent implements OnInit {
  @Input() table: any;
  @Output() close = new EventEmitter<void>(); 

  // Simulación de productos
  products = [
    { name: 'Pizza', amount: 2, price: 12.50 },
    { name: 'Pasta', amount: 1, price: 8.25 },
    { name: 'Salad', amount: 3, price: 6.75 }
  ];
  currentDate: Date = new Date();
  currentTime: string = '';
  order: Order | undefined;
  orderItems: OrderItem[] = [];

  ngOnInit() {
    this.updateCurrentTime();
  }

  // Actualizar la hora actual en tiempo real
  updateCurrentTime() {
    const hours = this.currentDate.getHours().toString().padStart(2, '0');
    const minutes = this.currentDate.getMinutes().toString().padStart(2, '0');
    this.currentTime = `${hours}:${minutes}`;
  }

  // Calcula el total de la orden
  calculateTotal() {
    return this.products.reduce((total, product) => total + product.amount * product.price, 0);
  }

  // Función para crear la orden
  createOrder() {
    const total = this.calculateTotal();
    this.order = {
      status: 'BUSY',
      tableNumber: this.table?.id,
      date: this.currentDate.toLocaleDateString(),
      time: this.currentTime,
      total: total.toString(),
      orderItems: this.orderItems
    };

    // Actualiza el estado de la mesa (puedes agregar lógica adicional según sea necesario)
    this.table.status = 'BUSY';

    console.log('Order created', this.order);
  }
  
  closeDialog() {
    console.log('Dialog closed');
    this.close.emit(); // Emitir el evento para cerrar el diálogo
  }
  
}

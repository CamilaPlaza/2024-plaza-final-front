import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Order } from 'src/app/models/order';
import { OrderItem } from 'src/app/models/orderItem';
import { Product } from 'src/app/models/product';
import { Table } from 'src/app/models/table';

@Component({
  selector: 'app-table-free',
  templateUrl: './table-free.component.html',
  styleUrls: ['./table-free.component.css']
})
export class TableFreeComponent implements OnInit {
  @Input() table: Table = new Table(0, '');
  @Output() close = new EventEmitter<void>();

  products: Product[] = [
    { name: 'Pizza', description: 'Delicious cheese pizza', price: '12.50', category: '1', id: 1 },
    { name: 'Burger', description: 'Juicy beef burger', price: '8.75', category: '2', id: 2 },
    { name: 'Pasta', description: 'Creamy alfredo pasta', price: '9.00', category: '3', id: 3 },
    { name: 'Salad', description: 'Fresh garden salad', price: '5.25', category: '1', id: 4 },
    { name: 'Soda', description: 'Refreshing soda drink', price: '1.50', category: '1, 2', id: 5 },
    { name: 'Coffee', description: 'Hot brewed coffee', price: '3.00', category: '2', id: 6 }
  ];

  orderItems: OrderItem[] = [];
  selectedProduct: Product | null = null;
  selectedAmount: number = 1;
  canAddProduct: boolean = false;

  currentDate: Date = new Date();
  currentTime: string = '';
  order: Order | undefined;

  ngOnInit() {
    this.updateCurrentTime();
  }

  // Actualizar la hora actual en tiempo real
  updateCurrentTime() {
    const hours = this.currentDate.getHours().toString().padStart(2, '0');
    const minutes = this.currentDate.getMinutes().toString().padStart(2, '0');
    this.currentTime = `${hours}:${minutes}`;
  }

  // Actualizar la selección de producto
  onProductChange() {
    this.validateForm();
  }

  // Validar si se puede agregar el producto a la lista
  validateForm() {
    this.canAddProduct = !!this.selectedProduct && this.selectedAmount > 0;
  }

  // Agregar un producto a la orden
  addOrderItem() {
    if (this.selectedProduct && this.selectedAmount > 0) {
      const newItem: OrderItem = {
        product: this.selectedProduct,
        amount: this.selectedAmount
      };
      this.orderItems.push(newItem);
      this.resetForm();
    }
  }

  // Eliminar un producto de la orden
  removeOrderItem(item: OrderItem) {
    const index = this.orderItems.indexOf(item);
    if (index > -1) {
      this.orderItems.splice(index, 1);
    }
  }

  // Resetear el formulario de selección de producto
  resetForm() {
    this.selectedProduct = null;
    this.selectedAmount = 1;
    this.canAddProduct = false;
  }

  // Calcula el total de la orden
  calculateTotal() {
    return this.orderItems.reduce((total, item) => total + item.amount * parseFloat(item.product.price), 0);
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

    // Actualiza el estado de la mesa
    this.table.status = 'BUSY';
    console.log('Order created', this.order);
    this.closeDialog();
    this.orderItems = [];
    this.order = undefined;
  }

  // Cerrar el diálogo
  closeDialog() {
    console.log('Dialog closed');
    this.orderItems = [];
    this.order = undefined;
    this.close.emit();
  }
}

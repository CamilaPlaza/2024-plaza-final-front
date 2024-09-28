import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { OrderItem } from 'src/app/models/orderItem';
import { Product } from 'src/app/models/product';
import { Table } from 'src/app/models/table';

@Component({
  selector: 'app-table-busy',
  templateUrl: './table-busy.component.html',
  styleUrl: './table-busy.component.css'
})
export class TableBusyComponent  implements OnInit {
  @Input() table: Table = new Table('');
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
  wantToAddNewProduct: boolean = false;

  ngOnInit() {
    //TO DO: HACER EL GET DE LOS PRODUCTOS
  }

  onProductChange() {
    this.validateForm();
  }

  validateForm() {
    this.canAddProduct = !!this.selectedProduct && this.selectedAmount > 0;
  }

  addOrderItem() {
    this.wantToAddNewProduct = true;
    if (this.selectedProduct && this.selectedAmount > 0) {
      const newItem: OrderItem = {
        product: this.selectedProduct,
        amount: this.selectedAmount
      };
      this.orderItems.push(newItem);
      this.resetForm();
    }
  }

  removeOrderItem(item: OrderItem) {
    const index = this.orderItems.indexOf(item);
    if (index > -1) {
      this.orderItems.splice(index, 1);
    }
  }

  resetForm() {
    this.selectedProduct = null;
    this.selectedAmount = 1;
    this.canAddProduct = false;
  }

  calculateTotal() {
    return this.orderItems.reduce((total, item) => total + item.amount * parseFloat(item.product.price), 0);
  }

  createOrder() {
    const total = this.calculateTotal();
    this.table.order = {
      status: 'BUSY',
      tableNumber: this.table?.id ?? 0,
      date: this.table.order?.date ?? '',
      time: this.table.order?.time ?? '',      
      total: total.toString(),
      orderItems: this.orderItems
    }; //TO DO: POSTEAR this.order

    this.updateTable();
  }

  updateTable(){
    //TO DO: QUE LO UPDATEE
    
    console.log('Table updated', this.table);
  }

  // Cerrar el diálogo
  closeDialog() {
    console.log('Dialog closed');
    this.close.emit();
  }
}

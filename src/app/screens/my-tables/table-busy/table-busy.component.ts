import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Order } from 'src/app/models/order';
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
  currentDate: string = '';
  currentTime: string = '';
  order: Order = new Order('',0,'','','',[]);
  selectedProduct: Product | null = null;
  selectedAmount: number = 1;
  canAddProduct: boolean = false;
  wantToAddNewProduct: boolean = false;
  displayConfirmDialog = false;
  displayCloseTableDialog = false;

  ngOnInit() {
    //TO DO: HACER EL GET DE LOS PRODUCTOS
    this.orderItems = this.table.order?.orderItems ?? [];
    this.currentDate = this.table.order?.date ?? '';
    this.currentTime = this.table.order?.time ?? '';
    this.order = this.table.order ?? new Order('',0,'','','',[]);
  }

  onProductChange() {
    this.validateForm();
  }

  validateForm() {
    this.canAddProduct = !!this.selectedProduct && this.selectedAmount > 0;
  }

  addNewProducts(){
    this.wantToAddNewProduct = true;
  }

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
    console.log('CREATE ORDER');
    const total = this.calculateTotal();
    this.order = {
      status: 'BUSY',
      tableNumber: this.table?.id ?? 0,
      date: this.currentDate,
      time: this.currentTime,      
      total: total.toString(),
      orderItems: this.orderItems
    }; //TO DO: ACTUALIZAR this.order
    /*try {

      const response = await this.orderService.onUpdate(this.order);
    */
   console.log('ORDER: ', this.order);
   this.closeConfirmDialog();

  }

  closeTable(){
    //UPDETEAR LA MESA
    this.table.status = 'FREE';
    this.table.order = undefined;
    //const response = await this.tableService.onUpdate(this.table);
    this.closeDialog();
  }

  closeTableAndSaveChanges(){
    this.createOrder();
    this.closeTable();
  }

  closeDialog() {
    console.log('Dialog closed');
    this.wantToAddNewProduct = false;
    this.close.emit();
  }

  showConfirmDialog() {
    this.displayConfirmDialog = true;
  }

  closeConfirmDialog() {
    console.log('CLOSE CONFIRM DE SALIR O NO DIALOG');
    
    this.displayConfirmDialog = false;
    this.closeDialog();
  }
  
  showCloseTableDialog() {
    this.displayCloseTableDialog = true;
  }

  closeCloseTableDialog() {
    console.log('CLOSE TABLE CLOSE DIALOG');
    this.displayCloseTableDialog = false;
  }
}

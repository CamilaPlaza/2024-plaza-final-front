import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Order } from 'src/app/models/order';
import { OrderItem } from 'src/app/models/orderItem';
import { Product } from 'src/app/models/product';
import { Table } from 'src/app/models/table';
import { ProductService } from 'src/app/services/product_service';

@Component({
  selector: 'app-table-busy',
  templateUrl: './table-busy.component.html',
  styleUrls: ['./table-busy.component.css'] // Cambié `styleUrl` a `styleUrls` para que sea correcto
})
export class TableBusyComponent implements OnInit {
  @Input() table: Table = new Table('');
  @Output() close = new EventEmitter<void>();

  ordersExample: Order[] = [
    new Order('In Process', 3, '2024-09-27', '14:30', '45.00', [
      { product: { id: 1, name: 'Pizza Margherita', description: 'Classic pizza with cheese and tomato', price: '15.00', category: '1, 2', calories: 220 }, amount: 1 },
      { product: { id: 2, name: 'Caesar Salad', description: 'Romaine lettuce with caesar dressing', price: '10.00', category: '3, 4', calories: 220 }, amount: 1 },
    ], 1),
    new Order('Delivered', 5, '2024-09-28', '18:00', '60.00', [
      { product: { id: 3, name: 'Spaghetti Carbonara', description: 'Spaghetti with creamy carbonara sauce', price: '20.00', category: '5, 6', calories: 350 }, amount: 2 },
      { product: { id: 4, name: 'Garlic Bread', description: 'Bread with garlic butter', price: '5.00', category: '7', calories: 150 }, amount: 2 },
    ], 2),
    new Order('Pending', 2, '2024-09-29', '12:00', '35.00', [
      { product: { id: 5, name: 'Grilled Chicken Sandwich', description: 'Chicken sandwich with lettuce and tomato', price: '12.00', category: '8, 9', calories: 300 }, amount: 1 },
      { product: { id: 6, name: 'French Fries', description: 'Crispy golden french fries', price: '8.00', category: '10', calories: 250 }, amount: 2 },
    ], 3),
  ];
  actualOrder?: Order;
  orderItems: OrderItem[] = [];
  products : Product[] = [];
  initialOrderItems: OrderItem[] = []; // Nueva variable para almacenar los items iniciales
  currentDate: string = '';
  currentTime: string = '';
  order: Order = new Order('', 0, '', '', '', []);
  selectedProduct: Product | null = null;
  selectedAmount: number = 1;
  canAddProduct: boolean = false;
  wantToAddNewProduct: boolean = false;
  displayConfirmDialog = false;
  displayCloseTableDialog = false;

  constructor(private productService: ProductService) {}
  ngOnInit() {
    //TO DO: HACER EL GET DE LOS PRODUCTOS
    this.loadProducts();
    this.getOrderInformation();
    this.orderItems = this.actualOrder?.orderItems ?? [];
    this.initialOrderItems = JSON.parse(JSON.stringify(this.orderItems));
    this.currentDate = this.actualOrder?.date ?? '';
    this.currentTime = this.actualOrder?.time ?? '';
    this.order = this.actualOrder ?? new Order('', 0, '', '', '', []);
  }

  getOrderInformation(){
    //Hacer un get de todas las orders
    if (this.table.order_id) {
      this.actualOrder = this.ordersExample.find(order => order.id === this.table.order_id);
    }
    return undefined;
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        console.log('Products fetched:', data);
        if (data && Array.isArray(data.products)) {
          this.products = data.products;
        } else {
          console.error('Unexpected data format:', data);
        }
      },
      error: (err) => {
        console.error('Error fetching products:', err);
      }
      
    });
  }

  onProductChange() {
    this.validateForm();
  }

  validateForm() {
    this.canAddProduct = !!this.selectedProduct && this.selectedAmount > 0;
  }

  addNewProducts() {
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
    };
    console.log('ORDER: ', this.order);
    this.closeConfirmDialog();
  }

  closeTable() {
    this.table.status = 'FREE';
    this.actualOrder = undefined;
    this.closeDialog();
  }

  closeTableAndSaveChanges() {
    this.createOrder();
    this.closeTable();
  }

  closeDialog() {
    console.log('Dialog closed');
    this.wantToAddNewProduct = false;
    this.close.emit();
  }

  showConfirmDialog() {
    if (this.hasChanges()) {
      this.displayConfirmDialog = true;
    } else {
      this.closeDialog();
    }
  }

  hasChanges(): boolean {
    return JSON.stringify(this.orderItems) !== JSON.stringify(this.initialOrderItems);
  }

  closeConfirmDialog() {
    this.displayConfirmDialog = false;
    this.closeDialog();
  }

  showCloseTableDialog() {
    this.displayCloseTableDialog = true;
  }

  closeCloseTableDialog() {
    this.displayCloseTableDialog = false;
  }
}

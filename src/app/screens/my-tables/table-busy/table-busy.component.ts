import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Order } from 'src/app/models/order';
import { OrderItem } from 'src/app/models/orderItem';
import { Product } from 'src/app/models/product';
import { Table } from 'src/app/models/table';
import { ProductService } from 'src/app/services/product_service';

@Component({
  selector: 'app-table-busy',
  templateUrl: './table-busy.component.html',
  styleUrls: ['./table-busy.component.css']
})
export class TableBusyComponent implements OnInit {
  @Input() table: Table = new Table('');
  @Output() close = new EventEmitter<void>();

  ordersExample: Order[] = [
    new Order('In Process', 3, '2024-09-27', '14:30', '45.00', [
      { product_id: 4, amount: 1 },
      { product_id: 5, amount: 1 },
    ], 1),
    new Order('Delivered', 5, '2024-09-28', '18:00', '60.00', [
      { product_id: 1, amount: 2 },
      { product_id: 2, amount: 2 },
    ], 2),
    new Order('Pending', 2, '2024-09-29', '12:00', '35.00', [
      { product_id: 1, amount: 1 },
      { product_id: 3, amount: 2 },
    ], 3),
  ];
  actualOrder?: Order; 
  orderItems: OrderItem[] = [];
  products : Product[] = [];
  initialOrderItems: OrderItem[] = [];
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
        product_id: this.selectedProduct.id ?? 0,
        amount: this.selectedAmount
      };
      this.orderItems.push(newItem);
      this.resetForm();
    }
  }

  getProductById(productId: number): Product | undefined {
    return this.products.find(product => product.id === productId);
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
    return this.orderItems.reduce((total, item) => {
      const product = this.products.find(p => p.id === item.product_id);
      console.log(product);
      return product ? total + item.amount * parseFloat(product.price) : total;
    }, 0);
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

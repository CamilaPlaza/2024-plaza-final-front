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
    this.orderItems = this.table.order?.orderItems ?? [];
    this.initialOrderItems = JSON.parse(JSON.stringify(this.orderItems)); // Guardar una copia de los items iniciales
    this.currentDate = this.table.order?.date ?? '';
    this.currentTime = this.table.order?.time ?? '';
    this.order = this.table.order ?? new Order('', 0, '', '', '', []);
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
    this.table.order = undefined;
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

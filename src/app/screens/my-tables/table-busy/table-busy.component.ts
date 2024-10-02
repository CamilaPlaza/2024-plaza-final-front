import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Order } from 'src/app/models/order';
import { OrderItem } from 'src/app/models/orderItem';
import { Product } from 'src/app/models/product';
import { Table } from 'src/app/models/table';
import { OrderService } from 'src/app/services/order_service';
import { ProductService } from 'src/app/services/product_service';

@Component({
  selector: 'app-table-busy',
  templateUrl: './table-busy.component.html',
  styleUrls: ['./table-busy.component.css']
})
export class TableBusyComponent implements OnInit {
  @Input() table: Table = new Table('');
  @Output() close = new EventEmitter<void>();
  ordersExample: Order[] = []
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
  loading: boolean = false;
  displayCloseTableDialog = false;

  constructor(private productService: ProductService,  private orderService: OrderService) {}
  ngOnInit() {
    this.loadProducts();
    this.getOrderInformation();
    this.orderItems = this.actualOrder?.orderItems ?? [];
    this.initialOrderItems = JSON.parse(JSON.stringify(this.orderItems));
    this.currentDate = this.actualOrder?.date ?? '';
    this.currentTime = this.actualOrder?.time ?? '';
    this.order = this.actualOrder ?? new Order('', 0, '', '', '', []);
  }

  getOrderInformation() {
    console.log(this.table)
    if (this.table.order_id) {
      this.orderService.getOrderById(this.table.order_id.toString()).subscribe({
        next: (order) => {
          this.actualOrder = order; 
          this.orderItems = this.actualOrder?.orderItems ?? [];
          this.currentDate = this.actualOrder?.date ?? '';
          this.currentTime = this.actualOrder?.time ?? '';
        },
        error: (err) => {
          console.error('Error fetching order information:', err);
        }
      });
    }
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
  
  getProductById(productId: number | undefined): Product | undefined {
    if (productId === undefined) {
      return undefined; 
    }
    return this.products.find(product => (product.id) === productId);
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
      return product ? total + item.amount * parseFloat(product.price) : total;
    }, 0);
  }

  //UPDATE
  updateOrder() {
    this.loading = true; // Iniciar el spinner
    const total = this.calculateTotal().toString(); 
  
    if (this.table.order_id) {
      this.orderService.addOrderItems(this.table.order_id.toString(), this.orderItems, total)
        .then(success => {
          if (success) {
            console.log('Order items added successfully');
            this.closeTable(); 
          } else {
            console.error('Error adding order items.');
          }
        })
        .catch(error => {
          console.error('Error adding order items:', error);
        })
        .finally(() => {
          this.loading = false; // Detener el spinner
        });
    } else {
      console.error('Order ID is undefined.');
      this.loading = false; // Detener el spinner si no hay ID
    }
  }
  

  closeTable() {
    this.table.status = 'FREE';
    this.actualOrder = undefined;
    this.closeDialog();
  }

  closeTableAndSaveChanges() {
    this.updateOrder();
    this.closeTable();
  }

  closeDialog() {
    this.wantToAddNewProduct = false;
    location.reload();
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

import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Order } from 'src/app/models/order';
import { OrderItem } from 'src/app/models/orderItem';
import { Product } from 'src/app/models/product';
import { Table } from 'src/app/models/table';
import { OrderService } from 'src/app/services/order_service';
import { ProductService } from 'src/app/services/product_service';
import { TableService } from 'src/app/services/table_service';

@Component({
  selector: 'app-table-busy',
  templateUrl: './table-busy.component.html',
  styleUrls: ['./table-busy.component.css']
})
export class TableBusyComponent implements OnInit {
  @Input() table: Table = new Table('');
  @Output() close = new EventEmitter<void>();
  actualOrder?: Order; 
  initialOI: OrderItem[] = [];
  orderItems: OrderItem[] = [];
  products : Product[] = [];
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

  constructor(private productService: ProductService,  private orderService: OrderService, private tableService: TableService) {}
  ngOnInit() {
    this.loadProducts();
    this.getOrderInformation();
    this.orderItems = this.actualOrder?.orderItems ?? [];
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
          this.initialOI = JSON.parse(JSON.stringify(order.orderItems));
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
    this.loading = true;
    const total = this.calculateTotal().toString(); 
    if (this.table.order_id) {
      this.orderService.addOrderItems(this.table.order_id.toString(), this.orderItems, total)
        .then(success => {
          if (success) {
            console.log('Order items added successfully');
            this.closeTableAndSaveChanges();
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
      this.closeDialog();
      this.loading = false;
    }
  }
  

  closeTable() {
    if (this.table.order_id) {
      this.orderService.finalizeOrder(this.table.order_id.toString()).subscribe({
        next: () => {
          console.log('Order status updated to FINALIZED');
          this.tableService.closeTable(this.table).subscribe({
            next: () => {
              console.log('Table closed successfully');
              this.closeDialog();
            },
            error: (err) => {
              console.error('Error closing table:', err);
            }
          });
        },
        error: (err) => {
          console.error('Error finalizing order:', err);
        }
      });
    } else {
      console.error('Order ID is undefined.');
    }
  }

  closeTableAndSaveChanges() {
    this.closeDialog();
  }

  closeDialog() {
    this.wantToAddNewProduct = false;
    this.displayConfirmDialog = false;
    location.reload();
    this.close.emit();  
  }
  showConfirmDialog() {
  
    if (this.areOrderItemsEqual(this.initialOI, this.orderItems)) {
      this.closeDialog();
    } else {
      this.displayConfirmDialog = true;
    }
  }
  
  areOrderItemsEqual(items1: OrderItem[] = [], items2: OrderItem[] = []): boolean {
    if (items1.length !== items2.length) {
      return false;
    }
  
    return items1.every((item, index) => 
      item.product_id === items2[index].product_id && item.amount === items2[index].amount
    );
  }


  showCloseTableDialog() {
    this.displayCloseTableDialog = true;
  }

  closeCloseTableDialog() {
    this.displayCloseTableDialog = false;
  }
}

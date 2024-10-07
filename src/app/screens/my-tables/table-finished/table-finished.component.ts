import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Order } from 'src/app/models/order';
import { OrderItem } from 'src/app/models/orderItem';
import { Product } from 'src/app/models/product';
import { Table } from 'src/app/models/table';
import { OrderService } from 'src/app/services/order_service';
import { ProductService } from 'src/app/services/product_service';
import { TableService } from 'src/app/services/table_service';


@Component({
  selector: 'app-table-finished',
  templateUrl: './table-finished.component.html',
  styleUrl: './table-finished.component.css'
})
export class TableFinishedComponent  implements OnInit {
  @Input() table: Table = new Table('');
  @Output() close = new EventEmitter<void>();
  actualOrder?: Order; 
  orderItems: OrderItem[] = [];
  products : Product[] = [];
  currentDate: string = '';
  currentTime: string = '';
  order: Order = new Order('', 0, '', '', '', []);
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

  calculateTotal() {
    return this.orderItems.reduce((total, item) => {
      const product = this.products.find(p => p.id === item.product_id);
      return product ? total + item.amount * parseFloat(product.price) : total;
    }, 0);
  }

  cleanTable() {
    this.tableService.cleanTable(this.table).subscribe({
      next: () => {
        console.log('Table cleaned successfully');
        this.closeDialog();
      },
      error: (err) => {
        console.error('Error cleaning table:', err);
      }        
    });
  }

  closeDialog() {
    this.displayConfirmDialog = false;
    this.close.emit();  
  }

  showCloseTableDialog() {
    this.displayCloseTableDialog = true;
  }

  closeCloseTableDialog() {
    this.displayCloseTableDialog = false;
  }
}

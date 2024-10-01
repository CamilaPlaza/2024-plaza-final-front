import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Order } from 'src/app/models/order';
import { OrderItem } from 'src/app/models/orderItem';
import { Product } from 'src/app/models/product';
import { Table } from 'src/app/models/table';
import { OrderService } from 'src/app/services/order_service';
import { ProductService } from 'src/app/services/product_service';

@Component({
  selector: 'app-table-free',
  templateUrl: './table-free.component.html',
  styleUrls: ['./table-free.component.css']
})
export class TableFreeComponent implements OnInit {
  @Input() table: Table = new Table('');
  @Output() close = new EventEmitter<void>();

  orderItems: OrderItem[] = [];
  selectedProduct: Product | null = null;
  selectedAmount: number = 1;
  canAddProduct: boolean = false;
  products : Product[] = [];
  currentDate: Date = new Date();
  currentTime: string = '';
  order: Order | undefined;

  constructor(private productService: ProductService, private orderService: OrderService) {}

  ngOnInit() {
    //TO DO: HACER EL GET DE LOS PRODUCTOS
    this.updateCurrentTime();
    this.loadProducts();
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

  updateCurrentTime() {
    const hours = this.currentDate.getHours().toString().padStart(2, '0');
    const minutes = this.currentDate.getMinutes().toString().padStart(2, '0');
    this.currentTime = `${hours}:${minutes}`;
  }
  onProductChange() {
    this.validateForm();
  }

  validateForm() {
    this.canAddProduct = !!this.selectedProduct && this.selectedAmount > 0;
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


  async createOrder() {
    const total = this.calculateTotal();
    this.order = {
      status: 'BUSY',
      tableNumber: this.table?.id ?? 0,
      date: this.currentDate.toLocaleDateString(),
      time: this.currentTime,
      total: total.toString(),
      orderItems: this.orderItems
    }; 
    try{
    const response = await this.orderService.onRegister(this.order);

      if (response) {
        console.log('Order Register successful', response);
      } else {
      }
    } catch (error: any) {

    this.updateTable();
    this.closeDialog();
  }}

  getProductById(productId: number): Product | undefined {
    return this.products.find(product => product.id === productId);
  }
  

  updateTable(){
    //TO DO: QUE LO UPDATEE
    this.table.status = 'BUSY';
    this.table.order_id = this.order?.id;  
    
    console.log('Table updated', this.table);
  }

  // Cerrar el diálogo
  closeDialog() {
    console.log('Dialog closed');
    this.orderItems = [];
    this.order = undefined;
    this.close.emit();
  }
}

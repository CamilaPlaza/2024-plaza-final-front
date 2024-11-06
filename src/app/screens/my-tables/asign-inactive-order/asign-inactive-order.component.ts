import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Order } from 'src/app/models/order';
import { OrderService } from 'src/app/services/order_service';
import { Table } from 'src/app/models/table';
import { ProductService } from 'src/app/services/product_service';
import { Product } from 'src/app/models/product';

@Component({
  selector: 'app-asign-inactive-order',
  templateUrl: './asign-inactive-order.component.html',
  styleUrls: ['./asign-inactive-order.component.css']
})
export class AsignInactiveOrderComponent implements OnInit {
  @Input() orders: any[] = []; 
  @Input() freeTables: any[] = [];
  @Output() close = new EventEmitter<void>();
  order!: Order;
  searchId: string = '';
  selectedOrder!: Order; 
  selectedTable!: Table;
  isLoading: boolean = false;
  productsStock: Map<number, number> = new Map(); 
  confirmationDialog: boolean = false;

  constructor(
    private orderService: OrderService, private productService: ProductService) {}

  ngOnInit(): void {
    if (this.selectedOrder) {
      this.loadProductStocks();
    }
  }

  get filteredOrders() {
    return this.orders.filter(order => order.id.includes(this.searchId));
  }

  selectOrder(order: any) {
    this.selectedOrder = order;
    this.freeTables = this.freeTables.filter(table => table.capacity >= order.amountOfPeople);
    this.loadProductStocks();
  }

  loadProductStocks(): void {
    if (this.selectedOrder) {
      this.selectedOrder.orderItems.forEach(item => {

        const productId = item.product_id.toString();
        this.productService.getProductById(productId).subscribe({
          next: (response: any) => {
            const product = response.product;
  
            if (product && product.stock !== undefined) {
              const stock = Number(product.stock);
              if (!isNaN(stock)) {
                this.productsStock.set(item.product_id, stock);
                this.checkProductAvailability(item, product);
              } else {
                console.error('Valor de stock no válido para el producto:', product);
              }
            } else {
              console.error('La respuesta no contiene stock válido para el producto:', response);
            }
          },
          error: (err) => {
            console.error('Error al obtener el producto:', err);
          }
        });
      });
    }
  }
  
  

  checkProductAvailability(item: any, product: Product): void {
    if (product.stock >= item.amount) {
      item.disabled = false;
    } else {
      item.disabled = true;
    }
  }

  assignTable() {
    if (this.selectedTable && this.selectedOrder) {
      this.createOrder(this.selectedOrder.id ?? 0, this.selectedTable.id ?? 0); 
    } else {
      alert('Por favor selecciona una mesa y una orden.');
    }
  }

  async createOrder(orderId: number, tableId: number) {
    this.isLoading = true; 
    this.orderService.assignOrderToTable(orderId, tableId).subscribe({
      next: (response) => {
        this.isLoading = false;
        this.close.emit();
      },
      error: (error) => {
        this.isLoading = false;
        this.close.emit();
      }
    });
  }

  showConfirmPopUp(){
    this.confirmationDialog = true;
  }

  closeConfirmationPopUp(){
    this.confirmationDialog = false;
    
  }
}

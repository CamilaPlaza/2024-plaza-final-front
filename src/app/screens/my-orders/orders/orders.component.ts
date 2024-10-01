import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/models/product';
import { ProductService } from 'src/app/services/product_service';
import { Order } from 'src/app/models/order';
import { OrderService } from 'src/app/services/order_service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
  
  products: Product[] = [];
  orders: Order[] = [];
  nroTableOptions: number[] = [];
  statusOptions: string[] = [];
  selectedNroTable: number[] = [];
  selectedStatus: string[] = [];
  selectedDate: Date = new Date();
  filteredOrders: Order[] = [];
  infoDialogVisible = false;
  selectedOrder!: Order;


  public tableScrollHeight: string='';

  constructor(private productService: ProductService, private orderService: OrderService) {
    this.filteredOrders = this.orders; 
    this.nroTableOptions = [...new Set(this.orders.map(order => order.tableNumber))];
    this.statusOptions = [...new Set(this.orders.map(order => order.status))];
    
  }

  ngOnInit(): void {
    this.loadOrders();
    this.loadProducts();
    this.setScrollHeight();
    this.filterOrdersByDate();
    
    window.addEventListener('resize', () => {
      this.setScrollHeight();
    }) 
  }

  setScrollHeight() {
    if (window.innerWidth <= 768) {
      this.tableScrollHeight = '800px';
    } else { 
      this.tableScrollHeight = '400px';
    }
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        console.log('Products fetched:', data);
        if (data && data.message && Array.isArray(data.products)) {
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

  loadOrders(): void{
    this.orderService.getOrders().subscribe({
      next: (data) => {
        console.log('Orders fetched:', data);
        if (data && data && Array.isArray(data)) {
          this.orders = data;
        } else {
          console.error('Unexpected data format:', data);
        }
      },
      error: (err) => {
        console.error('Error fetching orders:', err);
      }
    });
  }

  getSeverity(status: string) {
    if (status === 'In Progress') return 'success';
    if (status === 'Problem') return 'danger';
    if (status === 'Finished') return undefined;
    return 'info';
  }

  filterOrdersByDate(): void {
    const year = this.selectedDate.getFullYear();
    const month = (this.selectedDate.getMonth() + 1).toString().padStart(2, '0'); // Los meses empiezan desde 0
    const day = this.selectedDate.getDate().toString().padStart(2, '0');
    const formattedSelectedDate = `${year}-${month}-${day}`;
    this.filteredOrders = this.orders.filter(order => order.date === formattedSelectedDate);
  }

  displayInfoDialog(order: Order): void {
    this.selectedOrder = order; // Asigna la orden seleccionada
    this.infoDialogVisible = true; // Muestra el diálogo
  }
  

}

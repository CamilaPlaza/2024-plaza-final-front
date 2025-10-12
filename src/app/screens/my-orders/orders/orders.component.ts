import { Component, OnInit } from '@angular/core';
import { Order } from 'src/app/models/order';
import { OrderService } from 'src/app/services/order_service';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.css']
})
export class OrdersComponent implements OnInit {

  orders: Order[] = [];
  nroTableOptions: number[] = [];
  statusOptions: string[] = [];
  selectedDate: Date = new Date();
  filteredOrders: Order[] = [];
  infoDialogVisible = false;
  selectedOrder!: Order;
  loading = true;

  public tableScrollHeight: string = '';

  constructor(private orderService: OrderService) {}

  ngOnInit(): void {
    this.setScrollHeight();
    window.addEventListener('resize', () => this.setScrollHeight());
    this.loadOrders();
  }

  loadOrders(): void {
    this.loading = true;
    this.orderService.getOrders().subscribe({
      next: (orders) => {
        if (Array.isArray(orders)) {
          this.orders = orders;
          this.filterOrdersByDate();
          this.nroTableOptions = [...new Set(this.orders.map(o => o.tableNumber))];
          this.statusOptions = [...new Set(this.orders.map(o => o.status))];
        } else {
          console.error('Unexpected data format:', orders);
        }
        this.loading = false;
      },
      error: (err) => {
        console.error('Error loading orders:', err);
        this.loading = false;
      }
    });
  }

  setScrollHeight() {
    this.tableScrollHeight = window.innerWidth <= 768 ? '800px' : '400px';
  }

  getSeverity(status: string) {
    if (status === 'IN PROGRESS') return 'success';
    if (status === 'PROBLEM') return 'danger';
    if (status === 'FINALIZED') return undefined;
    return 'info';
  }

  filterOrdersByDate(): void {
    const year = this.selectedDate.getFullYear();
    const month = (this.selectedDate.getMonth() + 1).toString().padStart(2, '0');
    const day = this.selectedDate.getDate().toString().padStart(2, '0');
    const formattedSelectedDate = `${year}-${month}-${day}`;
    this.filteredOrders = this.orders.filter(o => o.date === formattedSelectedDate);
  }

  displayInfoDialog(order: Order): void {
    this.selectedOrder = order;
    this.infoDialogVisible = true;
  }
}

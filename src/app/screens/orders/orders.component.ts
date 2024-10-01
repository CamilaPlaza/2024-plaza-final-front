import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/models/product';
import { ProductService } from 'src/app/services/product_service';
import { Order } from 'src/app/models/order';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
  
  products: Product[] = [];
  orders: Order[] = [
    {
      id: 1,
      status: 'Finished',
      tableNumber: 3,
      date: '2024-09-29',
      time: '12:45',
      total: '25.00',
      orderItems: [
        { product_id: 1, amount: 2 },
        { product_id: 2, amount: 1 }
      ]
    },
    {
      id: 2,
      status: 'In Progress',
      tableNumber: 5,
      date: '2024-09-30',
      time: '13:15',
      total: '15.00',
      orderItems: [
        { product_id: 3, amount: 1 },
        { product_id: 4, amount: 1 }
      ]
    },
    {
      id: 3,
      status: 'In Progress',
      tableNumber: 1,
      date: '2024-09-30',
      time: '13:00',
      total: '12.00',
      orderItems: [
        { product_id: 5, amount: 1 }
      ]
    },
    {
      id: 4,
      status: 'Finished',
      tableNumber: 8,
      date: '2024-09-30',
      time: '13:30',
      total: '18.00',
      orderItems: [
        { product_id: 6, amount: 1 },
        { product_id: 7, amount: 1 },
        { product_id: 8, amount: 1 }
      ]
    },
    {
      id: 5,
      status: 'Problem',
      tableNumber: 2,
      date: '2024-09-30',
      time: '12:50',
      total: '10.00',
      orderItems: [
        { product_id: 9, amount: 2 },
        { product_id: 10, amount: 1 }
      ]
    }
  ];
  
  nroTableOptions: number[] = [];
  statusOptions: string[] = [];
  selectedNroTable: number[] = [];
  selectedStatus: string[] = [];
  selectedDate: Date = new Date();
  filteredOrders: Order[] = [];


  public tableScrollHeight: string='';

  constructor(private productService: ProductService) {
    this.filteredOrders = this.orders; 
    this.nroTableOptions = [...new Set(this.orders.map(order => order.tableNumber))];
    this.statusOptions = [...new Set(this.orders.map(order => order.status))];
    
  }

  ngOnInit(): void {
    this.loadProducts();
    this.setScrollHeight();
    this.filterOrdersByDate();
    
    window.addEventListener('resize', () => {
      this.setScrollHeight();
    }) 
  }

  setScrollHeight() {
    if (window.innerWidth <= 768) { // Móvil
      this.tableScrollHeight = '800px';
    } else { // Pantallas más grandes
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

  getSeverity(status: string) {
    // Define aquí la lógica para determinar la severidad según el estado
    if (status === 'In Progress') return 'success';
    if (status === 'Problem') return 'danger';
    if (status === 'Finished') return undefined;
    return 'info'; // Por defecto
  }

  // Método para filtrar órdenes por fecha seleccionada
  filterOrdersByDate(): void {
    const year = this.selectedDate.getFullYear();
    const month = (this.selectedDate.getMonth() + 1).toString().padStart(2, '0'); // Los meses empiezan desde 0
    const day = this.selectedDate.getDate().toString().padStart(2, '0');
    const formattedSelectedDate = `${year}-${month}-${day}`;
    this.filteredOrders = this.orders.filter(order => order.date === formattedSelectedDate);
  }
  

}

import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/models/product';
import { ProductService } from 'src/app/services/product_service';
import { Router } from '@angular/router'; 
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
      date: '2024-09-30',
      time: '12:45',
      total: '25.00',
      orderItems: [
        {
          product: { id: 1, name: 'Hamburguesa Clásica', description: 'Pan, carne, queso, lechuga, tomate', price: '10.00', category: 'Comida', calories: 500 },
          amount: 2
        },
        {
          product: { id: 2, name: 'Papas Fritas', description: 'Porción mediana', price: '5.00', category: 'Comida', calories: 300 },
          amount: 1
        }
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
        {
          product: { id: 3, name: 'Ensalada César', description: 'Lechuga, pollo, crutones, aderezo', price: '8.00', category: 'Comida', calories: 350 },
          amount: 1
        },
        {
          product: { id: 4, name: 'Limonada', description: 'Vaso grande', price: '4.00', category: 'Bebida', calories: 100 },
          amount: 1
        }
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
        {
          product: { id: 5, name: 'Pizza Margherita', description: 'Mozzarella, albahaca, tomate', price: '12.00', category: 'Comida', calories: 700 },
          amount: 1
        }
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
        {
          product: { id: 6, name: 'Sándwich Vegetariano', description: 'Pan integral, vegetales, queso', price: '7.00', category: 'Comida', calories: 400 },
          amount: 1
        },
        {
          product: { id: 7, name: 'Jugo de Naranja', description: 'Vaso grande', price: '4.00', category: 'Bebida', calories: 120 },
          amount: 1
        },
        {
          product: { id: 8, name: 'Brownie', description: 'Porción de brownie con nueces', price: '7.00', category: 'Postre', calories: 450 },
          amount: 1
        }
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
        {
          product: { id: 9, name: 'Té Helado', description: 'Vaso grande', price: '3.00', category: 'Bebida', calories: 80 },
          amount: 2
        },
        {
          product: { id: 10, name: 'Bagel con Queso Crema', description: 'Bagel con queso crema', price: '4.00', category: 'Comida', calories: 250 },
          amount: 1
        }
      ]
    }
  ];
  nroTableOptions: number[] = [];
  statusOptions: string[] = [];
  selectedNroTable: number[] = [];
  selectedStatus: string[] = [];


  public tableScrollHeight: string='';

  constructor(private productService: ProductService, private router: Router) {
    this.nroTableOptions = [...new Set(this.orders.map(order => order.tableNumber))];
    this.statusOptions = [...new Set(this.orders.map(order => order.status))];
    
  }

  ngOnInit(): void {
    this.loadProducts();
    this.setScrollHeight();
    window.addEventListener('resize', () => {
      this.setScrollHeight();
    });
  
  
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

}

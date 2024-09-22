import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/models/product';
import { ProductService } from 'src/app/services/product_service';
import { Router } from '@angular/router'; 

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrl: './orders.component.css'
})
export class OrdersComponent implements OnInit {
  products: Product[] = [];  // Arreglo para almacenar los productos
  categories = [
    { label: 'Breakfast', value: 'Breakfast' },
    { label: 'Lunch', value: 'Lunch' },
    { label: 'Dinner', value: 'Dinner' },
    { label: 'Drinks', value: 'Drinks' }
  ];
  displayConfirmDialog: boolean = false;
  deleteID: number = 0;
  public tableScrollHeight: string='';

  constructor(private productService: ProductService, private router: Router) {
    
  }

  ngOnInit(): void {
    this.loadProducts();
    // Productos de ejemplo
    this.products = [
      new Product('Breakfast Burrito', 'Scrambled eggs with sausage and cheese', '8.99', 'Breakfast', 1),
      new Product('Chicken Salad', 'Grilled chicken with mixed greens', '10.99', 'Lunch', 2),
      new Product('Spaghetti Carbonara', 'Pasta with creamy sauce and pancetta', '14.99', 'Dinner', 3),
      new Product('Margarita Pizza', 'Tomato, mozzarella, and fresh basil pizza', '12.99', 'Dinner', 4),
      new Product('Club Sandwich', 'Triple-layer sandwich with turkey, bacon, and lettuce', '9.99', 'Lunch', 5),
      new Product('Caesar Salad', 'Romaine lettuce with Caesar dressing', '7.99', 'Lunch', 6),
      new Product('Orange Juice', 'Freshly squeezed orange juice', '2.99', 'Drinks', 7),
      new Product('Cappuccino', 'Rich coffee with steamed milk and foam', '3.99', 'Drinks', 8),
      new Product('Grilled Cheese Sandwich', 'Classic grilled cheese on toasted bread', '5.49', 'Breakfast', 9),
      new Product('Chocolate Cake', 'Moist chocolate cake with frosting', '4.99', 'Dessert', 10),
  ];

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
  // Método para cargar los productos usando el servicio
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

  onRowEditInit(product: Product) {
    console.log('Row edit initialized', product);
  }

  onRowEditSave(product: Product) {
    if (parseFloat(product.price) < 0) {
      console.error('Price cannot be negative');
      return;
    }
    console.log('Row edit saved', product);
  }

  onRowEditCancel(product: Product, index: number) {
    console.log('Row edit cancelled', product, index);
  }

  deleteProduct() {
    this.products = this.products.filter(product => product.id !== this.deleteID);
    console.log('Product deleted:', this.deleteID);
    this.closeConfirmDialog();
  }


  customSort(event: { data: any[]; field: string; order: number }) {
    event.data.sort((data1, data2) => {
      let value1 = data1[event.field];
      let value2 = data2[event.field];
      let result = null;

      if (value1 == null && value2 != null) result = -1;
      else if (value1 != null && value2 == null) result = 1;
      else if (value1 == null && value2 == null) result = 0;
      else if (typeof value1 === 'string' && typeof value2 === 'string')
        result = value1.localeCompare(value2);
      else result = (value1 < value2) ? -1 : (value1 > value2) ? 1 : 0;

      return (event.order * result);
    });
  }

  navigateToRegisterProduct(): void {
    this.router.navigate(['/register-product']); // Asegúrate de que esta ruta esté configurada en tu router
  }

  showConfirmDialog(id: number) {
    this.deleteID = id;
    this.displayConfirmDialog = true;
  }

  closeConfirmDialog() {
    this.displayConfirmDialog = false;
  }
  
}

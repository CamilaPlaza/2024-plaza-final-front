import { Component } from '@angular/core';

@Component({
  selector: 'app-products-view',
  templateUrl: './products-view.component.html',
  styleUrls: ['./products-view.component.css']
})
export class ProductsViewComponent {
  products = [
    { name: 'Product A', price: 25.99, description: 'Description A', status: 'Available' },
    { name: 'Product B', price: 39.99, description: 'Description B', status: 'Out of Stock' },
    { name: 'Product C', price: 15.49, description: 'Description C', status: 'Available' },
    { name: 'Product D', price: 49.99, description: 'Description D', status: 'Discontinued' },
    { name: 'Product A', price: 25.99, description: 'Description A', status: 'Available' },
    { name: 'Product B', price: 39.99, description: 'Description B', status: 'Out of Stock' },
    { name: 'Product C', price: 15.49, description: 'Description C', status: 'Available' },
    { name: 'Product D', price: 49.99, description: 'Description D', status: 'Discontinued' }
  ];

  getSeverity(status: string): 'success' | 'info' | 'warning' | 'danger' | 'secondary' | 'contrast' {
    switch (status) {
      case 'Available': return 'success';
      case 'Out of Stock': return 'warning';
      case 'Discontinued': return 'danger';
      default: return 'info';
    }
  }
  
}

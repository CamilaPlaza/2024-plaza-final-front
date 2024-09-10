import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/models/product';
import { ProductService } from 'src/app/services/product_service';

@Component({
  selector: 'app-products-view',
  templateUrl: './products-view.component.html',
  styleUrls: ['./products-view.component.css']
})
export class ProductsViewComponent implements OnInit {
products: Product[] = [];  // Arreglo para almacenar los productos

constructor(private productService: ProductService) {}

ngOnInit(): void {
  this.loadProducts();
}

// Método para cargar los productos usando el servicio
loadProducts(): void {
  this.productService.getProducts().subscribe({
    next: (data) => {
      console.log('Products fetched:', data);
      if (data && data.message && Array.isArray(data.message.products)) {
        this.products = data.message.products;
      } else {
        console.error('Unexpected data format:', data);
      }
    },
    error: (err) => {
      console.error('Error fetching products:', err);
    }
  });
  }
  
}

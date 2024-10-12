import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Category } from 'src/app/models/category';
import { Product } from 'src/app/models/product';
import { CategoryService } from 'src/app/services/category_service';
import { ProductService } from 'src/app/services/product_service';

@Component({
  selector: 'app-menu',
  templateUrl: './menu.component.html',
  styleUrl: './menu.component.css'
})
export class MenuComponent implements OnInit {
  categories: Category[] = [];
  colors: string[] = ['#4281A4', '#035E7B', '#F5E7DE', '#844F39', '#54311A'];
  products : Product[] = [];
  visibleCategories: Category[] = [];
  selectedCategories: Category[] = [];
  searchQuery: string = '';
  filteredProducts: Product[] = [];
  currentIndex: number = 0;
  itemsPerPage: number = 6;
  cart: { [key: number]: number } = {};



  constructor(private productService: ProductService, private router: Router, private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories()
    this.loadProducts();
    
  }

  
  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        if (data && Array.isArray(data.products)) {
          this.products = data.products;
          this.filteredProducts = this.products; 
        } else {
          console.error('Unexpected data format:', data);
        }
      },
      error: (err) => {
        console.error('Error fetching products:', err);
      }
      
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        if (data && Array.isArray(data.categories)) {
          this.categories = data.categories.map((item, index) => ({
            id: item.id,
            name: item.name,
            type: item.type,
            color: this.colors[index % this.colors.length], // Asignar color de la paleta
          }));
          this.updateVisibleCategories();
        }
      },
      error: (err) => {
        console.error('Error fetching categories:', err);
      },
    });
  }

  searchProducts(event: any): void {
    const query = event.query.toLowerCase();
    this.filteredProducts = this.products.filter(product =>
      product.name.toLowerCase().includes(query)
    );
  }

  updateVisibleCategories(): void {
    this.visibleCategories = this.categories.slice(this.currentIndex, this.currentIndex + this.itemsPerPage);
  }

  nextPage(): void {
    if (this.currentIndex + this.itemsPerPage < this.categories.length) {
      this.currentIndex++;
      this.updateVisibleCategories();
    }
  }

  prevPage(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this.updateVisibleCategories();
    }
  }

  addProduct(productId: number): void {
    if (!this.cart[productId]) {
      this.cart[productId] = 0;
    }
    this.cart[productId]++;
  }


  incrementProduct(productId: number): void {
    this.cart[productId] = (this.cart[productId] || 0) + 1;
  }

  decrementProduct(productId: number): void {
    if (this.cart[productId] > 0) {
      this.cart[productId]--;
    }
  }

  getProductCount(productId: number): number {
    return this.cart[productId] || 0;
  }

  toggleCategorySelection(category: Category): void {
    const index = this.selectedCategories.indexOf(category);
    if (index === -1) {
      this.selectedCategories.push(category);
    } else {
      this.selectedCategories.splice(index, 1);
    }
    this.filterProductsByCategory();
  }

    filterProductsByCategory(): void {
      if (this.selectedCategories.length === 0) {
        this.filteredProducts = this.products; 
      } else {
        const categoryIds = this.selectedCategories.map(category => category.id).join(', ');
        this.getProductsByCategory(categoryIds);
      }
    }

  // Obtener productos por categoría desde el servicio
  getProductsByCategory(categoryIds: string): void {
    this.categoryService.getProductsByCategory(categoryIds)
      .then((data) => {
        if (data && Array.isArray(data)) {
          this.filteredProducts = data;
          
      console.log('filteredprod en data',   this.filteredProducts );
        } else {
          this.filteredProducts = [];
        }
      })
      .catch((err) => {
        console.error('Error fetching products by category:', err);
        this.filteredProducts = []; 
      });
  }

  


}

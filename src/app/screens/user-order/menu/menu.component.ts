import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Category } from 'src/app/models/category';
import { OrderItem } from 'src/app/models/orderItem';
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
  colors: string[] = ['#7f522e', '#915728', '#b2682b', '#caa171', '#c39158', '#b37a3a'];
  products : Product[] = [];
  visibleCategories: Category[] = [];
  selectedCategories: Category[] = [];
  searchQuery: string = '';
  filteredProducts: Product[] = [];
  currentIndex: number = 0;
  itemsPerPage: number = 6;
  orderItems: OrderItem[] = [];
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
    const product = this.products.find(p => p.id === productId); // Busca el producto
    const amount = this.getProductCount(productId) + 1; // Obtiene la cantidad actual y la incrementa

    // Verifica que el producto exista
    if (product) {
        const orderItem = this.orderItems.find(item => item.product_id === productId);
        
        if (orderItem) {
            orderItem.amount += 1; // Incrementa la cantidad en el OrderItem si ya existe
        } else {
            // Crea un nuevo OrderItem si no existe
            this.orderItems.push(new OrderItem(productId, 1, product.name, product.price.toString()));
        }

        this.cart[productId] = (this.cart[productId] || 0) + 1; // Actualiza la cantidad en el carrito
    } else {
        console.error('Product not found');
    }
}


  getTotalItemsInCart(): number {
    return Object.values(this.cart).reduce((acc, count) => acc + count, 0);
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

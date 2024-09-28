import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/models/product';
import { ProductService } from 'src/app/services/product_service';
import { CategoryService } from 'src/app/services/category_service';
import { Router } from '@angular/router'; 
import { Category } from 'src/app/models/category';

@Component({
  selector: 'app-products-view',
  templateUrl: './products-view.component.html',
  styleUrls: ['./products-view.component.css']
})
export class ProductsViewComponent implements OnInit {
  categories: Category[] = [];
  products : Product[] = [];
  selectedCategories: Category[] = [];
  displayConfirmDialog: boolean = false;
  deleteID: number = 0;
  editingProductCategories: { [key: number]: Category[] } = {};
  originalProductState: { [key: number]: Product } = {}; // Store original state
  public tableScrollHeight: string='';

  constructor(private productService: ProductService, private router: Router, private categoryService: CategoryService) {}

  ngOnInit(): void {
    this.loadCategories();
    this.loadProducts();
    this.setScrollHeight();
    window.addEventListener('resize', () => {
      this.setScrollHeight();
    });
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
        next: (data) => {
            console.log('Categories fetched:', data);
            // Access the categories property from the response
            if (data && Array.isArray(data.categories)) {
                this.categories = data.categories.map(item => ({
                    id: item.id,
                    name: item.name,
                    type: item.type
                }));
            } else {
                console.error('Unexpected data format for categories:', data);
            }
        },
        error: (err) => {
            console.error('Error fetching categories:', err);
        }
    });
}



getCategoryNamesByIds(ids: any): string {
  // Verifica si ids no es una cadena
  if (typeof ids !== 'string' || !ids) {
    return '';
  }

  const idArray = ids.split(',').map(id => id.trim());
  const categoryNames = this.categories
    .filter(category => category.id !== undefined && idArray.includes(category.id.toString()))
    .map(category => category.name);

  return categoryNames.join(', ');
}


  
  
  updateTempSelectedCategories(productId: number, selectedCategories: Category[]): void {
    this.editingProductCategories[productId] = [...selectedCategories];
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
        if (data && Array.isArray(data.products)) {
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

    if (product.id === undefined) {
      console.error('Product ID is undefined');
      return;
    }

    // Store original product state for comparison
    this.originalProductState[product.id] = { ...product };

    const categoryIds = product.category.split(',').map(id => id.trim());
    console.log(this.categories);
    this.editingProductCategories[product.id] = this.categories
      .filter((category: Category) => category.id && categoryIds.includes(category.id.toString()));
  }

  async onRowEditSave(product: Product) {
    if (product.id === undefined) {
      console.error('Product ID is undefined');
      return;
    }

    const originalProduct = this.originalProductState[product.id];
    const tempCategories = this.editingProductCategories[product.id];
    
    // Update category if modified
    if (tempCategories) {
      const selectedIds = tempCategories.map(category => category.id).join(', ');
      if (selectedIds !== originalProduct.category) {
        product.category = selectedIds;
      }
    }

    console.log('onRowEditSave called with product CATEGORY:', product.category);

    // Validate price
    if (parseFloat(product.price) < 0) {
      console.error('Price cannot be negative');
      return;
    }

    // Update only modified fields
    const promises: Promise<any>[] = [];
    
    if (product.price !== originalProduct.price) {
      console.log('Price updated');
      promises.push(this.productService.updateProductPrice(String(product.id), parseFloat(product.price)));
    }

    if (product.description !== originalProduct.description) {
      console.log('Description updated');
      promises.push(this.productService.updateProductDescription(String(product.id), product.description));
    }

    if (product.category !== originalProduct.category) {
      console.log('Categories updated');
      promises.push(this.productService.updateProductCategories(String(product.id), product.category));
    }

    try {
      await Promise.all(promises);
      console.log('Row edit saved', product);
    } catch (error) {
      console.error('Failed to update product', error);
    }

    // Clear original product state after saving
    delete this.originalProductState[product.id];
  }

  onRowEditCancel(product: Product, index: number) {
    console.log('Row edit cancelled', product, index);
  
    if (product.id !== undefined) {
      delete this.editingProductCategories[product.id];
      delete this.originalProductState[product.id]; // Clear original state on cancel
    } else {
      console.error('Product ID is undefined, cannot cancel edit');
    }
  }

  deleteProduct() {
    this.productService.deleteProduct((this.deleteID).toString()).then(success => {
      if (success) {
        this.products = this.products.filter(product => product.id !== this.deleteID);
        console.log('Product deleted:', this.deleteID);
      } else {
        console.error('Failed to delete product:', this.deleteID);
      }
      this.closeConfirmDialog();
    });
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

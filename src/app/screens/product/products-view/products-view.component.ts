import { Component, OnInit } from '@angular/core';
import { Product } from 'src/app/models/product';
import { ProductService } from 'src/app/services/product_service';
import { Router } from '@angular/router'; 
import { Category } from 'src/app/models/category';

@Component({
  selector: 'app-products-view',
  templateUrl: './products-view.component.html',
  styleUrls: ['./products-view.component.css']
})
export class ProductsViewComponent implements OnInit {
  categories: Category [] = [];
  products: Product[] = [];
  selectedCategories: Category[] = [];
  displayConfirmDialog: boolean = false;
  deleteID: number = 0;
  editingProductCategories: { [key: number]: Category[] } = {};
  public tableScrollHeight: string='';

  constructor(private productService: ProductService, private router: Router) {}

  ngOnInit(): void {
    this.loadProducts();

    this.setScrollHeight();
    window.addEventListener('resize', () => {
      this.setScrollHeight();
    });

    //LLAMADA AL GET CATEGORIES!!
  }

  getCategories(){
      //this.categories = el servicio
  }

  getCategoryNamesByIds(ids: string): string {
    if (!ids) {
      return '';
    }

    const idArray = ids.split(',').map(id => id.trim());
    const categoryNames = this.categories
      .filter(category => category.id && idArray.includes(category.id.toString()))
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

    const categoryIds = product.category.split(',').map(id => id.trim());

    this.editingProductCategories[product.id] = this.categories
      .filter((category: Category) => category.id && categoryIds.includes(category.id.toString()));
  }

  async onRowEditSave(product: Product) {

    if (product.id === undefined) {
      console.error('Product ID is undefined');
      return;
    }

    const tempCategories = this.editingProductCategories[product.id];
    if (tempCategories) {
      const selectedIds = tempCategories.map(category => category.id).join(', ');
      product.category = selectedIds;
    }

    console.log('onRowEditSave called with product CATEGORY:', product.category);

    if (parseFloat(product.price) < 0) {
      console.error('Price cannot be negative');
      return;
    }

    const priceUpdated = await this.productService.updateProductPrice(String(product.id), parseFloat(product.price));
    if (!priceUpdated) {
      console.error('Failed to update product price');
      return;
    }

    if (product.description) {
      const descriptionUpdated = await this.productService.updateProductDescription(String(product.id), product.description);
      if (!descriptionUpdated) {
        console.error('Failed to update product description');
        return;
      }
    }

    console.log('Row edit saved', product);
  }

  onRowEditCancel(product: Product, index: number) {
    console.log('Row edit cancelled', product, index);
  
    if (product.id !== undefined) {
      delete this.editingProductCategories[product.id];
    } else {
      console.error('Product ID is undefined, cannot cancel edit');
    }
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

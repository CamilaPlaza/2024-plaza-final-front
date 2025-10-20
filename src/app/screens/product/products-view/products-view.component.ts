import { Component, OnInit, OnDestroy } from '@angular/core';
import { Product } from 'src/app/models/product';
import { ProductService } from 'src/app/services/product_service';
import { CategoryService } from 'src/app/services/category_service';
import { Router } from '@angular/router';
import { Category } from 'src/app/models/category';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-products-view',
  templateUrl: './products-view.component.html',
  styleUrls: ['./products-view.component.css']
})
export class ProductsViewComponent implements OnInit, OnDestroy {
  categories: Category[] = [];
  products : Product[] = [];
  selectedCategories: Category[] = [];
  filteredProducts: Product[] = [];
  selectedFilterCategories: string[] = [];
  displayConfirmDialog: boolean = false;
  deleteID: number = 0;
  editingProductCategories: { [key: number]: Category[] } = {};
  originalProductState: { [key: number]: Product } = {};
  selectedProduct!: Product;
  dialogNoticeError: boolean = false;
  dialogNoticeSuccess: boolean = false;
  displayUpdateStockDialog: boolean = false;
  lowStockProducts: any[] = [];
  lowStockCount: number = 0;
  alertStockDialog: boolean = false;
  public tableScrollHeight: string = '';

  // 🔹 Spinner de página
  isLoading = true;

  constructor(private productService: ProductService, private router: Router, private categoryService: CategoryService) {}

  ngOnInit(): void {
    // Bloqueo de scroll mientras carga
    document.body.style.overflow = 'hidden';

    this.loadAll(); // ⬅️ spinner se apaga cuando termina esto
    this.setScrollHeight();
    window.addEventListener('resize', () => this.setScrollHeight());
  }

  ngOnDestroy(): void {
    // Restaurar scroll por las dudas
    document.body.style.overflow = '';
  }

  /** Carga categorías + productos y apaga el spinner al final */
  private loadAll(): void {
    forkJoin({
      cats: this.categoryService.getCategories(),
      prods: this.productService.getProducts()
    }).subscribe({
      next: ({ cats, prods }: any) => {
        // Categorías
        if (cats && Array.isArray(cats.categories)) {
          this.categories = cats.categories.map((item: any) => ({
            id: item.id,
            name: item.name,
            type: item.type
          }));
        } else {
          console.error('Unexpected categories format:', cats);
        }

        // Productos
        if (prods && Array.isArray(prods.products)) {
          this.products = prods.products;
          this.filteredProducts = [...this.products];
          this.filterLowStockProducts();
        } else {
          console.error('Unexpected products format:', prods);
        }
      },
      error: (err) => {
        console.error('Error loading data:', err);
      },
      complete: () => {
        this.isLoading = false;
        document.body.style.overflow = ''; // habilito scroll
      }
    });
  }

  // --- lo tuyo de antes, sin tocar ---
  getCategoryNamesByIds(ids: any): string {
    if (typeof ids !== 'string' || !ids) return '';
    const idArray = ids.split(',').map((id: string) => id.trim());
    const categoryNames = this.categories
      .filter(category => category.id !== undefined && idArray.includes(category.id.toString()))
      .map(category => category.name);
    return categoryNames.join(', ');
  }

  filterByCategory(selectedCategoryIds: string[]): void {
    this.selectedFilterCategories = selectedCategoryIds;
    if (this.selectedFilterCategories.length === 0) {
      this.filteredProducts = [...this.products];
    } else {
      this.filteredProducts = this.products.filter(product => {
        const productCategories = product.category.split(',').map((id: string) => parseInt(id.trim(), 10));
        return this.selectedFilterCategories.some(categoryId => productCategories.includes(parseInt(categoryId)));
      });
    }
  }

  updateTempSelectedCategories(productId: number, selectedCategories: Category[]): void {
    this.editingProductCategories[productId] = [...selectedCategories];
  }

  setScrollHeight() {
    this.tableScrollHeight = window.innerWidth <= 768 ? '800px' : '400px';
  }

  filterLowStockProducts() {
    this.lowStockProducts = this.filteredProducts.filter(product => {
      const stock = parseInt(product.stock, 10);
      return stock < 50;
    });
    this.lowStockCount = this.lowStockProducts.length;
    if (this.lowStockCount > 0) this.showAlertStockDialog();
  }

  isLowStock(stock: string): boolean {
    return parseInt(stock, 10) < 50;
  }

  showAlertStockDialog(){ this.alertStockDialog = true; }
  closeAlertStockDialog(){ this.alertStockDialog = false; }

  onRowEditInit(product: Product) {
    if (product.id === undefined) return console.error('Product ID is undefined');
    this.originalProductState[product.id] = { ...product };
    const categoryIds = product.category.split(',').map(id => id.trim());
    this.editingProductCategories[product.id] = this.categories
      .filter((category: Category) => category.id && categoryIds.includes(category.id.toString()));
  }

  async onRowEditSave(product: Product) {
    if (product.id === undefined) return;
    const originalProduct = this.originalProductState[product.id];
    const tempCategories = this.editingProductCategories[product.id];

    if (tempCategories) {
      const selectedIds = tempCategories.map(category => category.id).join(', ');
      if (selectedIds !== originalProduct.category) product.category = selectedIds;
    }

    if (parseFloat(product.price.toString()) < 0) {
      console.error('Price cannot be negative');
      return;
    }

    const promises: Promise<any>[] = [];
    if (product.price !== originalProduct.price) {
      promises.push(this.productService.updateProductPrice(String(product.id), product.price));
    }
    if (product.description !== originalProduct.description) {
      promises.push(this.productService.updateProductDescription(String(product.id), product.description));
    }
    if (product.category !== originalProduct.category) {
      promises.push(this.productService.updateProductCategories(String(product.id), product.category));
    }

    try { await Promise.all(promises); }
    catch (error) { console.error('Failed to update product', error); }

    delete this.originalProductState[product.id];
  }

  onRowEditCancel(product: Product, index: number) {
    if (product.id !== undefined) {
      delete this.editingProductCategories[product.id];
      delete this.originalProductState[product.id];
    } else {
      console.error('Product ID is undefined, cannot cancel edit');
    }
    location.reload();
  }

  isProductDataValid(product: Product): boolean {
    if (product.id === undefined) return false;
    const price = Number(product.price);
    const tempCategories = this.editingProductCategories[product.id];
    return !isNaN(price) && price > 0 && !!product.description && !!tempCategories && tempCategories.length > 0;
  }

  deleteProduct() {
    this.productService.deleteProduct((this.deleteID).toString()).then(success => {
      if (success) this.products = this.products.filter(product => product.id !== this.deleteID);
      this.closeConfirmDialog();
    });
  }

  customSort(event: { data: any[]; field: string; order: number }) {
    event.data.sort((a, b) => {
      const v1 = a[event.field], v2 = b[event.field];
      let result = 0;
      if (v1 == null && v2 != null) result = -1;
      else if (v1 != null && v2 == null) result = 1;
      else if (v1 == null && v2 == null) result = 0;
      else if (typeof v1 === 'string' && typeof v2 === 'string') result = v1.localeCompare(v2);
      else result = v1 < v2 ? -1 : v1 > v2 ? 1 : 0;
      return event.order * result;
    });
  }

  navigateToRegisterProduct(): void { this.router.navigate(['/register-product']); }
  showConfirmDialog(id: number) { this.deleteID = id; this.displayConfirmDialog = true; }
  showUpdateStockDialog() { this.displayUpdateStockDialog = true; }
  closeConfirmDialog() { this.displayConfirmDialog = false; }
  successUpdate(){ location.reload(); this.dialogNoticeSuccess = false; this.displayUpdateStockDialog = false; }
}

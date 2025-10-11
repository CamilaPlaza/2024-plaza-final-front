// src/app/components/table-busy/table-busy.component.ts
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Category } from 'src/app/models/category';
import { Order } from 'src/app/models/order';
import { OrderItem } from 'src/app/models/orderItem';
import { Product } from 'src/app/models/product';
import { Table } from 'src/app/models/table';
import { CategoryService } from 'src/app/services/category_service';
import { OrderService } from 'src/app/services/order_service';
import { ProductService } from 'src/app/services/product_service';
import { TableService } from 'src/app/services/table_service';
import { UserService } from 'src/app/services/user_service';
import { firstValueFrom } from 'rxjs';

@Component({
  selector: 'app-table-busy',
  templateUrl: './table-busy.component.html',
  styleUrls: ['./table-busy.component.css']
})
export class TableBusyComponent implements OnInit {
  @Input() table: Table = new Table('',1);
  @Output() close = new EventEmitter<void>();
  actualOrder?: Order;
  initialOI: OrderItem[] = [];
  orderItems: OrderItem[] = [];
  products : Product[] = [];
  currentDate: string = '';
  currentTime: string = '';
  employee: string = '';
  order: Order = new Order('', 0, '', '', '', [],1, '') ;
  selectedProduct: Product | null = null;
  selectedAmount: number = 1;
  canAddProduct: boolean = false;
  wantToAddNewProduct: boolean = false;
  displayConfirmDialog = false;
  loading: boolean = false;
  displayCloseTableDialog = false;
  amountOfPeople: number = 0;
  categories: Category[] = [];
  selectedCategories: Array<{ id: any, name: string }> = [];
  filteredProducts: Product[] = [];
  user: any | null;
  newOrderItems: OrderItem[] = [];
  initialLoading: boolean = true;
  private productsLoaded: boolean = false;
  private categoriesLoaded: boolean = false;
  private orderLoaded: boolean = false;

  tipMode: 'none' | 'percent' | 'absolute' = 'none';
  tipPercent: 5 | 10 | 15 | null = null;
  tipAbsolute: string = '';

  constructor(private productService: ProductService,  private orderService: OrderService, private tableService: TableService, private categoryService: CategoryService, private userService: UserService) {}

  async ngOnInit() {
    this.loadProducts();
    this.getOrderInformation();
    this.orderItems = this.actualOrder?.orderItems ?? [];
    this.currentDate = this.actualOrder?.date ?? '';
    this.currentTime = this.actualOrder?.time ?? '';
    this.order = this.actualOrder ?? new Order('', 0, '', '', '', [],1, '');
    this.loadCategories();
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        if (data && Array.isArray(data.categories)) {
          this.categories = data.categories.map(item => ({
            id: item.id,
            name: item.name,
            type: item.type
          }));
        }
        this.categoriesLoaded = true;
        this.checkInitLoadingDone();
      },
      error: (err) => {
        this.categoriesLoaded = true;
        this.checkInitLoadingDone();
      }
    });
  }

  filterProductsByCategory() {
    if (this.selectedCategories.length === 0) {
      this.filteredProducts = [];
    } else {
      const categoryIds = this.selectedCategories.map((category: { id: any; }) => category.id).join(', ');
      this.getProductsByCategory(categoryIds);
    }
  }

  async getOrderInformation() {
    if (this.table.order_id) {
      this.orderService.getOrderById(this.table.order_id.toString()).subscribe({
        next: async (order) => {
          this.actualOrder = order;
          this.orderItems = this.actualOrder?.orderItems ?? [];
          this.initialOI = JSON.parse(JSON.stringify(order.orderItems));
          this.currentDate = this.actualOrder?.date ?? '';
          this.currentTime = this.actualOrder?.time ?? '';
          this.amountOfPeople = this.actualOrder.amountOfPeople ?? 0;
          if (this.actualOrder.employee) {
            try {
              const userData = await firstValueFrom(await this.userService.getUserDataFromFirestore(this.actualOrder.employee));
              this.employee = userData?.name ?? 'Unknown Employee';
            } catch {}
          }
          this.orderLoaded = true;
          this.checkInitLoadingDone();
        },
        error: () => {
          this.orderLoaded = true;
          this.checkInitLoadingDone();
        }
      });
    } else {
      this.orderLoaded = true;
      this.checkInitLoadingDone();
    }
  }

  loadProducts(): void {
    this.productService.getProducts().subscribe({
      next: (data) => {
        if (data && Array.isArray(data.products)) {
          this.products = data.products;
        }
        this.productsLoaded = true;
        this.checkInitLoadingDone();
      },
      error: () => {
        this.productsLoaded = true;
        this.checkInitLoadingDone();
      }
    });
  }

  private checkInitLoadingDone() {
    if (this.productsLoaded && this.categoriesLoaded && this.orderLoaded) {
      this.initialLoading = false;
    }
  }

  validateForm() {
    this.canAddProduct = !!this.selectedProduct && this.selectedAmount > 0;
    return !this.canAddProduct;
  }

  addNewProducts() {
    this.wantToAddNewProduct = true;
  }

  addOrderItem() {
    if (this.selectedProduct && this.selectedAmount > 0) {
      const newItem: OrderItem = {
        product_id: this.selectedProduct.id ?? 0,
        amount: this.selectedAmount,
        product_name: this.selectedProduct.name,
        product_price: this.selectedProduct.price
      };
      this.orderItems.push(newItem);
      this.newOrderItems.push(newItem);
      this.resetForm();
    }
  }

  getProductById(productId: number | undefined): Product | undefined {
    if (productId === undefined) {
      return undefined;
    }
    return this.products.find(product => (product.id) === productId);
  }

  removeOrderItem(item: OrderItem) {
    const index = this.orderItems.indexOf(item);
    if (index > -1) {
      this.orderItems.splice(index, 1);
    }
  }

  resetForm() {
    this.selectedProduct = null;
       this.selectedAmount = 1;
    this.canAddProduct = false;
  }

  calculateTotal() {
    return this.orderItems.reduce((total, item) => {
      const product = this.products.find(p => p.id === item.product_id);
      return product ? total + item.amount * parseFloat(product.price) : total;
    }, 0);
  }

  get maxTip(): number {
    return Math.max(0, this.calculateTotal());
  }

  // Bloquea notación científica y signos en el input number
  blockInvalidKeys(e: KeyboardEvent) {
    if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
  }

  // Recorta el valor tipeado al rango [1, maxTip] y redondea a 2 dec.
  clampTip() {
    let v = Number(this.tipAbsolute);
    if (isNaN(v)) { this.tipAbsolute = ''; return; }
    if (v < 1) v = 1;
    const max = this.maxTip;
    if (v > max) v = max;
    v = Math.round(v * 100) / 100;
    this.tipAbsolute = v.toString();
  }


  async updateOrder() {
    this.loading = true;
    const total = this.calculateTotal().toString();
    if (this.table.order_id) {
      try {
        const success = await this.orderService.addOrderItems(this.table.order_id.toString(), this.orderItems, total);
        if (success) {
          await this.updateProductsStock();
        }
      } catch (error) {
      } finally {
        this.loading = false;
        this.closeDialog();
      }
    } else {
      this.loading = false;
    }
  }

  async closeAndUpdateOrder() {
    this.displayCloseTableDialog = true;
    this.tipMode = 'none';
    this.tipPercent = null;
    this.tipAbsolute = '';
  }

async confirmCloseWithTip() {
  if (!this.table.order_id) return;

  this.loading = true;

  try {
    const ok = await this.ensureOrderItemsSaved();
    if (!ok) {
      this.loading = false;
      return;
    }

    console.log("finalizando orden");
    await this.orderService.finalizeOrder(this.table.order_id.toString()).toPromise();

    if (this.tipMode === 'percent' && (this.tipPercent === 5 || this.tipPercent === 10 || this.tipPercent === 15)) {
      await this.orderService.applyTip(this.table.order_id.toString(), 'percent', this.tipPercent);
    } else if (this.tipMode === 'absolute') {
      const val = Number(this.tipAbsolute);
      if (val > 0) {
        console.log("aplicando tip");
        await this.orderService.applyTip(this.table.order_id.toString(), 'absolute', val);
      }
    }

    await this.tableService.closeTable(this.table).toPromise();
    this.closeDialog();
  } catch (e) {
    console.error(e);
  } finally {
    this.loading = false;
    this.displayCloseTableDialog = false;
  }
}


  private async ensureOrderItemsSaved(): Promise<boolean> {
    const total = this.calculateTotal().toString();
    try {
      const ok = await this.orderService.addOrderItems(this.table.order_id!.toString(), this.orderItems, total);
      if (ok) {
        await this.updateProductsStock();
      }
      return ok;
    } catch {
      return false;
    }
  }

  tipPreview(): number {
    const total = this.calculateTotal();
    if (this.tipMode === 'percent' && this.tipPercent) {
      return Math.round((total * (this.tipPercent / 100)) * 100) / 100;
    }
    if (this.tipMode === 'absolute') {
      const v = Number(this.tipAbsolute);
      if (!isNaN(v) && v > 0) return Math.round(v * 100) / 100;
    }
    return 0;
  }

  limitTipInput(e: KeyboardEvent) {
    if (['e', 'E', '+', '-'].includes(e.key)) {
      e.preventDefault();
      return;
    }

    const value = (e.target as HTMLInputElement).value;
    const newChar = e.key;

    if (['Backspace', 'ArrowLeft', 'ArrowRight', 'Delete', 'Tab'].includes(e.key)) return;

    const newValue = value + newChar;
    const numericValue = Number(newValue);

    if (!isNaN(numericValue) && numericValue > this.maxTip) {
      e.preventDefault();
    }
  }


  canSubmitClose(): boolean {
    if (this.tipMode === 'none') return true;
    if (this.tipMode === 'percent')
      return this.tipPercent === 5 || this.tipPercent === 10 || this.tipPercent === 15;
    if (this.tipMode === 'absolute') {
      const v = Number(this.tipAbsolute);
      return !isNaN(v) && v > 0 && v <= this.maxTip;
    }
    return false;
  }

  selectPercent(p: 5 | 10 | 15) {
    this.tipMode = 'percent';
    this.tipPercent = p;
    this.tipAbsolute = '';
  }

  selectAbsoluteMode() {
    this.tipMode = 'absolute';
    this.tipPercent = null;
  }

  selectNoTip() {
    this.tipMode = 'none';
    this.tipPercent = null;
    this.tipAbsolute = '';
  }

  closeDialog() {
    this.wantToAddNewProduct = false;
    this.displayConfirmDialog = false;
    this.displayCloseTableDialog = false;
    location.reload();
    this.close.emit();
  }

  showConfirmDialog() {
    if (this.areOrderItemsEqual(this.initialOI, this.orderItems)) {
      this.closeDialog();
    } else {
      this.displayConfirmDialog = true;
    }
  }

  areOrderItemsEqual(items1: OrderItem[] = [], items2: OrderItem[] = []): boolean {
    if (items1.length !== items2.length) {
      return false;
    }
    return items1.every((item, index) =>
      item.product_id === items2[index].product_id && item.amount === items2[index].amount
    );
  }

  getProductsByCategory(categoryIds: string) {
    this.categoryService.getProductsByCategory(categoryIds)
      .then((data) => {
        if (data && Array.isArray(data)) {
          this.filteredProducts = data.map(product => ({
            ...product,
            disabled: product.stock === '0'
          }));
        } else {
          this.filteredProducts = [];
        }
      })
      .catch(() => {
        this.filteredProducts = [];
      });
  }

  onProductChange(event: any) {
    const selectedProduct = event.value;
    if (selectedProduct?.disabled) {
      this.selectedProduct = null;
    }
  }

  validateAmount() {
    const maxStock = Number(this.selectedProduct?.stock) || 1;
    const enteredAmount = Number(this.selectedAmount);
    if (enteredAmount > maxStock) {
      this.selectedAmount = maxStock;
    } else if (enteredAmount < 1) {
      this.selectedAmount = 1;
    } else {
      this.selectedAmount = enteredAmount;
    }
  }

  showCloseTableDialog() {
    this.displayCloseTableDialog = true;
    this.tipMode = 'none';
    this.tipPercent = null;
    this.tipAbsolute = '';
  }

  closeCloseTableDialog() {
    this.displayCloseTableDialog = false;
  }

  async updateProductsStock() {
    try {
      const updatePromises = this.newOrderItems.map(orderItem =>
        this.productService.updateLowerStock(
          orderItem.product_id?.toString() ?? '',
          orderItem.amount.toString()
        )
      );
      await Promise.all(updatePromises);
    } catch (error) {
    }
  }
}

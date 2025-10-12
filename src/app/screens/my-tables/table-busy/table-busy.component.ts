import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Category } from 'src/app/models/category';
import { Order } from 'src/app/models/order';
import { Product } from 'src/app/models/product';
import { Table } from 'src/app/models/table';
import { CategoryService } from 'src/app/services/category_service';
import { OrderService } from 'src/app/services/order_service';
import { ProductService } from 'src/app/services/product_service';
import { TableService } from 'src/app/services/table_service';
import { UserService } from 'src/app/services/user_service';
import { firstValueFrom } from 'rxjs';

type OrderItemView = {
  product_id: number | string;
  amount: number;
  product_name?: string | null;
  product_price?: string | null;
};

@Component({
  selector: 'app-table-busy',
  templateUrl: './table-busy.component.html',
  styleUrls: ['./table-busy.component.css']
})
export class TableBusyComponent implements OnInit {
  @Input() table: Table = new Table('', 1);
  @Input() readOnly: boolean = false;
  @Output() close = new EventEmitter<void>();

  actualOrder?: Order;
  initialOI: OrderItemView[] = [];
  orderItems: OrderItemView[] = [];
  products: Product[] = [];
  currentDate: string = '';
  currentTime: string = '';
  employee: string = '';
  order: Order = new Order('', 0, '', '', '', [], 1, '');
  selectedProduct: Product | null = null;
  selectedAmount: number = 1;
  canAddProduct: boolean = false;
  wantToAddNewProduct: boolean = false;
  displayConfirmDialog = false;
  loading: boolean = false;
  displayCloseTableDialog = false;
  amountOfPeople: number = 0;
  categories: Category[] = [];
  selectedCategories: Array<{ id: any; name: string }> = [];
  filteredProducts: Product[] = [];
  user: any | null;
  newOrderItems: OrderItemView[] = [];
  initialLoading: boolean = true;
  private productsLoaded: boolean = false;
  private categoriesLoaded: boolean = false;
  private orderLoaded: boolean = false;

  tipMode: 'none' | 'percent' | 'absolute' = 'none';
  tipPercent: 5 | 10 | 15 | null = null;
  tipAbsolute: string = '';

  constructor(
    private productService: ProductService,
    private orderService: OrderService,
    private tableService: TableService,
    private categoryService: CategoryService,
    private userService: UserService
  ) {}

  async ngOnInit() {
    this.loadProducts();
    this.getOrderInformation();
    this.orderItems = [];
    this.currentDate = this.actualOrder?.date ?? '';
    this.currentTime = this.actualOrder?.time ?? '';
    this.order = this.actualOrder ?? new Order('', 0, '', '', '', [], 1, '');
    this.loadCategories();
  }

  private mapToView(items: any[] | undefined): OrderItemView[] {
    if (!Array.isArray(items)) return [];
    return items.map((it: any) => ({
      product_id: it?.product_id,
      amount: Number(it?.amount ?? 0),
      product_name: it?.product_name ?? null,
      product_price: it?.product_price ?? null
    }));
  }

  loadCategories(): void {
    this.categoryService.getCategories().subscribe({
      next: (data) => {
        if (data && Array.isArray(data.categories)) {
          this.categories = data.categories.map((item) => ({
            id: item.id,
            name: item.name,
            type: item.type
          }));
        }
        this.categoriesLoaded = true;
        this.checkInitLoadingDone();
      },
      error: () => {
        this.categoriesLoaded = true;
        this.checkInitLoadingDone();
      }
    });
  }

  filterProductsByCategory() {
    if (this.selectedCategories.length === 0) {
      this.filteredProducts = [];
    } else {
      const categoryIds = this.selectedCategories.map((category: { id: any }) => category.id).join(', ');
      this.getProductsByCategory(categoryIds);
    }
  }

  async getOrderInformation() {
    if (this.table.order_id) {
      this.orderService.getOrderById(this.table.order_id.toString()).subscribe({
        next: async (order) => {
          this.actualOrder = order;
          this.orderItems = this.mapToView(this.actualOrder?.orderItems);
          this.initialOI = JSON.parse(JSON.stringify(this.orderItems)) as OrderItemView[];
          this.currentDate = this.actualOrder?.date ?? '';
          this.currentTime = this.actualOrder?.time ?? '';
          this.amountOfPeople = this.actualOrder?.amountOfPeople ?? 0;
          if (this.actualOrder?.employee) {
            try {
              const userData = await firstValueFrom(
                await this.userService.getUserDataFromFirestore(this.actualOrder.employee)
              );
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

  private getCatalogProduct(pid: number | string | undefined): Product | undefined {
    if (pid === undefined || pid === null) return undefined;
    const n = Number(pid);
    return this.products.find((p) => Number(p.id) === n);
  }

  private calculateNewItemsTotal(): number {
    return this.newOrderItems.reduce((acc, it) => {
      const prod = this.getCatalogProduct(it.product_id);
      const price = prod ? Number(prod.price) : 0;
      return acc + Number(it.amount) * price;
    }, 0);
  }

  calculateTotal() {
    return this.orderItems.reduce((total, item) => {
      const hasItemPrice = item.product_price !== undefined && item.product_price !== null && item.product_price !== '';
      const unit = hasItemPrice ? Number(item.product_price) : Number(this.getCatalogProduct(item.product_id)?.price ?? 0);
      return total + Number(item.amount) * unit;
    }, 0);
  }

  get maxTip(): number {
    return Math.max(0, this.calculateTotal());
  }

  validateForm() {
    this.canAddProduct = !!this.selectedProduct && this.selectedAmount > 0;
    return !this.canAddProduct;
  }

  addNewProducts() {
    if (this.readOnly) return;
    this.wantToAddNewProduct = true;
  }

  addOrderItem() {
    if (this.readOnly) return;
    if (this.selectedProduct && this.selectedAmount > 0) {
      const prod = this.getCatalogProduct(this.selectedProduct.id);
      const newItem: OrderItemView = {
        product_id: Number(prod?.id ?? this.selectedProduct.id ?? 0),
        amount: Number(this.selectedAmount),
        product_name: prod?.name ?? this.selectedProduct.name,
        product_price: String(prod?.price ?? this.selectedProduct.price)
      };
      this.orderItems.push(newItem);
      this.newOrderItems.push(newItem);
      this.resetForm();
    }
  }

  getProductById(productId: number | string | undefined): Product | undefined {
    if (productId === undefined) return undefined;
    const n = Number(productId);
    return this.products.find((product) => Number(product.id) === n);
  }

  removeOrderItem(item: OrderItemView) {
    if (this.readOnly) return;
    const index = this.orderItems.indexOf(item);
    if (index > -1) this.orderItems.splice(index, 1);
    this.newOrderItems = this.newOrderItems.filter(
      (ni) =>
        !(
          Number(ni.product_id) === Number(item.product_id) &&
          Number(ni.amount) === Number(item.amount) &&
          String(ni.product_name ?? '') === String(item.product_name ?? '') &&
          String(ni.product_price ?? '') === String(item.product_price ?? '')
        )
    );
  }

  resetForm() {
    this.selectedProduct = null;
    this.selectedAmount = 1;
    this.canAddProduct = false;
  }

  blockInvalidKeys(e: KeyboardEvent) {
    if (['e', 'E', '+', '-'].includes(e.key)) e.preventDefault();
  }

  clampTip() {
    let v = Number(this.tipAbsolute);
    if (isNaN(v)) {
      this.tipAbsolute = '';
      return;
    }
    if (v < 1) v = 1;
    const max = this.maxTip;
    if (v > max) v = max;
    v = Math.round(v * 100) / 100;
    this.tipAbsolute = v.toString();
  }

  async updateOrder() {
    if (this.readOnly) return;
    this.loading = true;
    if (!this.table.order_id) {
      this.loading = false;
      return;
    }
    try {
      const ok = await this.ensureOrderItemsSaved();
      if (ok && this.newOrderItems.length > 0) {
        await this.updateProductsStock();
        this.newOrderItems = [];
      }
    } catch {
    } finally {
      this.loading = false;
      this.closeDialog();
    }
  }

  async closeAndUpdateOrder() {
    if (this.readOnly) return;
    this.displayCloseTableDialog = true;
    this.tipMode = 'none';
    this.tipPercent = null;
    this.tipAbsolute = '';
  }

  async confirmCloseWithTip() {
    if (this.readOnly) return;
    if (!this.table.order_id) return;
    this.loading = true;
    try {
      const ok = await this.ensureOrderItemsSaved();
      if (!ok) {
        this.loading = false;
        return;
      }
      if (this.newOrderItems.length > 0) {
        await this.updateProductsStock();
        this.newOrderItems = [];
      }
      await this.orderService.finalizeOrder(this.table.order_id.toString()).toPromise();
      if (this.tipMode === 'percent' && (this.tipPercent === 5 || this.tipPercent === 10 || this.tipPercent === 15)) {
        await this.orderService.applyTip(this.table.order_id.toString(), 'percent', this.tipPercent);
      } else if (this.tipMode === 'absolute') {
        const val = Number(this.tipAbsolute);
        if (val > 0) {
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
    if (!this.table.order_id) return false;
    if (!this.newOrderItems || this.newOrderItems.length === 0) return true;
    const newItems = this.newOrderItems.map((it) => {
      const prod = this.getCatalogProduct(it.product_id);
      return {
        product_id: Number(it.product_id),
        amount: Number(it.amount),
        product_name: prod?.name ?? it.product_name ?? '',
        product_price: String(prod?.price ?? it.product_price ?? '')
      };
    });
    const total = String(this.calculateNewItemsTotal());
    try {
      const ok = await this.orderService.addOrderItems(this.table.order_id!.toString(), newItems, total);
      return ok;
    } catch {
      return false;
    }
  }

  tipPreview(): number {
    const total = this.calculateTotal();
    if (this.tipMode === 'percent' && this.tipPercent) {
      return Math.round(total * (this.tipPercent / 100) * 100) / 100;
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
    if (this.tipMode === 'percent') return this.tipPercent === 5 || this.tipPercent === 10 || this.tipPercent === 15;
    if (this.tipMode === 'absolute') {
      const v = Number(this.tipAbsolute);
      return !isNaN(v) && v > 0 && v <= this.maxTip;
    }
    return false;
  }

  selectPercent(p: 5 | 10 | 15) {
    if (this.readOnly) return;
    this.tipMode = 'percent';
    this.tipPercent = p;
    this.tipAbsolute = '';
  }

  selectAbsoluteMode() {
    if (this.readOnly) return;
    this.tipMode = 'absolute';
    this.tipPercent = null;
  }

  selectNoTip() {
    if (this.readOnly) return;
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
    if (this.readOnly) return;
    if (this.areOrderItemsEqual(this.initialOI, this.orderItems)) {
      this.closeDialog();
    } else {
      this.displayConfirmDialog = true;
    }
  }

  areOrderItemsEqual(items1: OrderItemView[] = [], items2: OrderItemView[] = []): boolean {
    if (items1.length !== items2.length) return false;
    return items1.every(
      (item, index) => item.product_id === items2[index].product_id && item.amount === items2[index].amount
    );
  }

  getProductsByCategory(categoryIds: string) {
    this.categoryService
      .getProductsByCategory(categoryIds)
      .then((data) => {
        if (data && Array.isArray(data)) {
          this.filteredProducts = data.map((product) => ({
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
    if (this.readOnly) return;
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
      const updatePromises = this.newOrderItems.map((orderItem) =>
        this.productService.updateLowerStock(
          String(orderItem.product_id ?? ''),
          String(orderItem.amount)
        )
      );
      await Promise.all(updatePromises);
    } catch {}
  }
}

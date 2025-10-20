// asign-inactive-order.component.ts
import { Component, Input, Output, EventEmitter, OnInit } from '@angular/core';
import { Order } from 'src/app/models/order';
import { OrderService } from 'src/app/services/order_service';
import { Table } from 'src/app/models/table';
import { ProductService } from 'src/app/services/product_service';
import { Product } from 'src/app/models/product';
import { UserService } from 'src/app/services/user_service';
import { getAuth, onAuthStateChanged, User } from 'firebase/auth';

@Component({
  selector: 'app-asign-inactive-order',
  templateUrl: './asign-inactive-order.component.html',
  styleUrls: ['./asign-inactive-order.component.css']
})
export class AsignInactiveOrderComponent implements OnInit {
  @Input() orders: any[] = [];
  @Input() freeTables: any[] = [];
  @Output() close = new EventEmitter<void>();
  order!: Order;
  searchId: string = '';
  selectedOrder!: Order;
  selectedTable!: Table;
  isLoading: boolean = false;
  productsStock: Map<number, number> = new Map();
  confirmationDialog: boolean = false;

  disabledProductIds: string[] = [];
  user: any | null;
  uid: string = '';

  constructor(
    private orderService: OrderService,
    private userService: UserService,
    private productService: ProductService
  ) {}

  async ngOnInit() {
    try {
      // Aseguramos UID antes de hacer cualquier cosa que lo necesite
      await this.ensureUid();

      // (Opcional) si necesitás userData, lo podés pedir acá:
      // const userDataObs = await this.userService.getUserDataFromFirestore(this.uid);
      // userDataObs.subscribe((ud: any) => this.user = ud);

      if (this.selectedOrder) {
        this.loadProductStocks();
      }
    } catch (e) {
      console.error('No se pudo inicializar el usuario:', e);
    }
  }

  /** Espera a tener un UID válido (sin tocar servicios) */
  private async ensureUid(): Promise<void> {
    // 1) Si ya lo tenemos del servicio, usalo
    if (this.userService.currentUser?.uid) {
      this.uid = this.userService.currentUser.uid;
      return;
    }

    // 2) Si no, esperamos a Firebase
    const auth = getAuth();
    const existing: User | null = auth.currentUser;
    if (existing?.uid) {
      this.uid = existing.uid;
      return;
    }

    // 3) Nos suscribimos one-shot al cambio de auth
    this.uid = await new Promise<string>((resolve, reject) => {
      const unsub = onAuthStateChanged(auth, (u) => {
        unsub();
        if (u?.uid) resolve(u.uid);
        else reject(new Error('No hay sesión activa'));
      });
    });
  }

  get filteredOrders() {
    // id puede venir como number, lo pasamos a string para includes
    return this.orders.filter(order => String(order.id).includes(this.searchId));
  }

  selectOrder(order: any) {
    this.selectedOrder = order;
    this.freeTables = this.freeTables.filter(table => table.capacity >= order.amountOfPeople);
    this.loadProductStocks();
  }

  loadProductStocks(): void {
    if (this.selectedOrder) {
      this.selectedOrder.orderItems.forEach(item => {
        const productId = item.product_id.toString();
        this.productService.getProductById(productId).subscribe({
          next: (response: any) => {
            const product = response.product;
            if (product && product.stock !== undefined) {
              const stock = Number(product.stock);
              if (!isNaN(stock)) {
                this.productsStock.set(item.product_id, stock);
                this.checkProductAvailability(item, product);
              } else {
                console.error('Valor de stock no válido para el producto:', product);
              }
            } else {
              console.error('La respuesta no contiene stock válido para el producto:', response);
            }
          },
          error: (err) => {
            console.error('Error al obtener el producto:', err);
          }
        });
      });
    }
  }

  checkProductAvailability(item: any, product: Product): void {
    if (product.stock >= item.amount) {
      item.disabled = false;
    } else {
      item.disabled = true;
      this.disabledProductIds.push(item.product_id);
    }
  }

  assignTable() {
    this.isLoading = true;
    if (this.selectedTable && this.selectedOrder) {
      console.log(`Asignando la mesa ${this.selectedTable.id} a la orden ${this.selectedOrder.id}`);
      this.deleteDisabledItemsAndAssignOrder();
    } else {
      alert('Por favor selecciona una mesa y una orden.');
      this.isLoading = false;
    }
  }

  async deleteDisabledItemsAndAssignOrder() {
    try {
      if (this.disabledProductIds.length > 0) {
        const selectedOrderId = this.selectedOrder.id ?? '0';
        this.orderService.deleteOrderItems(selectedOrderId.toString(), this.disabledProductIds).subscribe({
          next: async () => {
            await this.updateProductsStock();
            await this.createOrder(this.selectedOrder.id ?? 0, this.selectedTable.id ?? 0);
          },
          error: (error) => {
            console.error('Error al eliminar productos deshabilitados:', error);
            this.isLoading = false;
          }
        });
      } else {
        await this.updateProductsStock();
        await this.createOrder(this.selectedOrder.id ?? 0, this.selectedTable.id ?? 0);
      }
    } catch (e) {
      console.error('Fallo al actualizar stock/asignar:', e);
      this.isLoading = false;
    }
  }

  async updateProductsStock() {
    try {
      const availableItems = this.selectedOrder.orderItems.filter(
        orderItem => !this.disabledProductIds.includes(orderItem.product_id.toString())
      );
      const updatePromises = availableItems.map(orderItem =>
        this.productService.updateLowerStock(
          orderItem.product_id?.toString() ?? '',
          orderItem.amount.toString()
        )
      );
      const responses = await Promise.all(updatePromises);
      console.log('All updates successful', responses);
    } catch (error) {
      console.error('One or more updates failed', error);
      throw error;
    }
  }

  async createOrder(orderId: number, tableId: number) {
    try {
      // fuerza a tener uid válido por si se deslogueó en el medio
      await this.ensureUid();

      this.orderService.assignEmployeeToOrder(orderId, this.uid).subscribe(
        () => {
          this.orderService.assignOrderToTable(orderId, tableId).subscribe({
            next: async () => {
              this.isLoading = false;
              this.close.emit();
            },
            error: (error) => {
              console.error('Error al asignar la orden:', error);
              this.isLoading = false;
            }
          });
        },
        (error) => {
          console.error('Error assigning employee:', error);
          this.isLoading = false;
        }
      );
    } catch (e) {
      console.error('No se pudo obtener UID:', e);
      this.isLoading = false;
    }
  }

  showConfirmPopUp(){
    this.confirmationDialog = true;
  }

  closeConfirmationPopUp(){
    this.confirmationDialog = false;
  }
}

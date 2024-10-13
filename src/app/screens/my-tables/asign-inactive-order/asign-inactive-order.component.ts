import { Component, Input, Output, EventEmitter } from '@angular/core';
import { TableService } from 'src/app/services/table_service';
import { Order } from 'src/app/models/order';
import { OrderService } from 'src/app/services/order_service';
import { Table } from 'src/app/models/table';

@Component({
  selector: 'app-asign-inactive-order',
  templateUrl: './asign-inactive-order.component.html',
  styleUrls: ['./asign-inactive-order.component.css']
})
export class AsignInactiveOrderComponent {
  @Input() orders: any[] = []; 
  @Input() freeTables: any[] = [];
  @Output() close = new EventEmitter<void>();
  order!: Order;
  searchId: string = '';
  selectedOrder!: Order; 
  selectedTable!: Table;

  constructor(
    private orderService: OrderService
  ) {}

  get filteredOrders() {
    return this.orders.filter(order => order.id.includes(this.searchId));
  }

  selectOrder(order: any) {
    this.selectedOrder = order;

    // Filtrar las mesas disponibles según la capacidad
    this.freeTables = this.freeTables.filter(table => table.capacity >= order.amountOfPeople);
  }

  assignTable() {
    if (this.selectedTable && this.selectedOrder) {
      console.log(`Asignando la mesa ${this.selectedTable.id} a la orden ${this.selectedOrder.id}`);
      this.createOrder(this.selectedOrder.id ?? 0, this.selectedTable.id ?? 0); // Asegúrate de llamar a la función createOrder para completar la asignación
    } else {
      alert('Por favor selecciona una mesa y una orden.');
    }
  }

  async createOrder(orderId: number, tableId: number) {
    this.orderService.assignOrderToTable(orderId, tableId).subscribe({
      next: (response) => {
        console.log('Successfully assigned order:', response);
        this.close.emit();
      },
      error: (error) => {
        console.error('Error during assignment:', error);
        this.close.emit();
      }
    });
  }
  

}

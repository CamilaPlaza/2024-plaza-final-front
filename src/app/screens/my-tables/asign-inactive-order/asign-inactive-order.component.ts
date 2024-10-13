import { Component, Input, Output, EventEmitter } from '@angular/core';

@Component({
  selector: 'app-asign-inactive-order',
  templateUrl: './asign-inactive-order.component.html',
  styleUrls: ['./asign-inactive-order.component.css']
})
export class AsignInactiveOrderComponent {
  @Input() orders: any[] = []; 
  @Input() tables: any[] = [];
  @Output() close = new EventEmitter<void>();

  searchId: string = '';
  selectedOrder: any; 
  selectedTableId: number | null = null;

  get filteredOrders() {
    return this.orders.filter(order => order.id.includes(this.searchId));
  }

  selectOrder(order: any) {
    this.selectedOrder = order;
  }

  assignTable() {
    if (this.selectedTableId && this.selectedOrder) {
      console.log(`Asignando la mesa ${this.selectedTableId} a la orden ${this.selectedOrder.id}`);

      
      this.close.emit();
    } else {
      alert('Por favor selecciona una mesa y una orden.');
    }
  }
}

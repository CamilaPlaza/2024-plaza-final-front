import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { Order } from 'src/app/models/order';
import { OrderItem } from 'src/app/models/orderItem';

@Component({
  selector: 'app-order-info',
  templateUrl: './order-info.component.html',
  styleUrls: ['./order-info.component.css']
})
export class OrderInfoComponent implements OnInit  {
  @Input() order: Order = new Order('', 0, '', '', '', [], 1, '');
  @Output() onClose = new EventEmitter<void>();
  @Output() onSend = new EventEmitter<void>();

  ngOnInit() {
  }

  items(): OrderItem[] {
    return Array.isArray(this.order?.orderItems) ? this.order.orderItems : [];
  }

  toNumber(value: string | number): number {
    if (typeof value === 'number') return value;
    const n = Number(String(value).replace(',', '.'));
    return isNaN(n) ? 0 : n;
  }

  itemTotal(item: OrderItem): number {
    return (item?.amount ?? 0) * this.toNumber((item as any)?.product_price ?? 0);
  }

  money(n: number): string {
    return new Intl.NumberFormat('es-AR', { style: 'currency', currency: 'ARS', maximumFractionDigits: 0 }).format(n);
  }

  calculatedSubtotal(): number {
    return this.items().reduce((acc, it) => acc + this.itemTotal(it), 0);
  }

  sendConfirmation() {
    this.onSend.emit();
  }

  closeDialog() {
    this.onClose.emit();
  }
}

import { Component, EventEmitter, Input, Output } from '@angular/core';
import { Product } from 'src/app/models/product';

@Component({
  selector: 'app-alert-stock',
  templateUrl: './alert-stock.component.html',
  styleUrl: './alert-stock.component.css'
})
export class AlertStockComponent {
  @Input() outOfStockProducts: Product[] = [];
  @Output() onClose = new EventEmitter<void>();

  closeDialog() {
    this.onClose.emit();
  }
}

import { Component, Input } from '@angular/core';
import { OrderItem } from 'src/app/models/orderItem';

@Component({
  selector: 'app-my-cart',
  templateUrl: './my-cart.component.html',
  styleUrl: './my-cart.component.css'
})
export class MyCartComponent {
  @Input() orderItems: OrderItem[] = [];
  @Input() isVisible: boolean = false;

   // Método para cerrar el carrito
   closeCart(): void {
    this.isVisible = false;
}

// Método para crear una orden (implementar la lógica de creación aquí)
createOrder(): void {
    // Lógica para crear la orden
    console.log('Creating order...', this.orderItems);
}

// Obtener el precio total
getTotalPrice(): number {
    return this.orderItems.reduce((total, item) => total + (item.amount * parseFloat(item.product_price)), 0);
}

// Método para incrementar la cantidad de un producto
incrementProduct(productId: number): void {
    const orderItem = this.orderItems.find(item => item.product_id === productId);
    if (orderItem) {
        orderItem.amount += 1;
    }
}

// Método para decrementar la cantidad de un producto
decrementProduct(productId: number): void {
    const orderItem = this.orderItems.find(item => item.product_id === productId);
    if (orderItem && orderItem.amount > 1) {
        orderItem.amount -= 1;
    } else if (orderItem && orderItem.amount === 1) {
        // Si el amount es 1, podrías optar por eliminarlo o solo reducirlo a 0
        this.orderItems = this.orderItems.filter(item => item.product_id !== productId);
    }
}

}

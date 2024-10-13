import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Order } from '../models/order';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private baseUrl = 'https://candvbar-back.onrender.com';
  //private baseLocalUrl = 'http://127.0.0.1:8000';
  constructor(private http: HttpClient) { }

  async onRegister(order: Order): Promise<any | null> { // Cambia el tipo de retorno a `any`
    try {
        const response = await this.http.post(`${this.baseUrl}/register-order`, order).toPromise();
        console.log("RESPONSE", response); // Imprime la respuesta completa
        return response;  // Devuelves la respuesta completa
    } catch (error: any) {
        console.error('Error durante el registro:', error);
        return null;
    }
}

  async addOrderItems(orderId: string, newItems: any[], total: string): Promise<boolean> {
    try {
      // Crea un objeto que contenga tanto los nuevos items como el total
      const body = { new_order_items: newItems, new_order_total: total };

      // Envía el objeto completo como cuerpo de la solicitud
      await this.http.put(`${this.baseUrl}/orders/order-items/${orderId}`, body).toPromise();
      
      return true;
    } catch (error: any) {
      console.error('Error adding order items:', error);
      return false;
    }
  }


  getOrderById(orderId: string): Observable<Order> {
    return this.http.get<Order>(`${this.baseUrl}/orders/${orderId}`);
  }

  getOrders(): Observable<Order>{
    return this.http.get<Order>(`${this.baseUrl}/orders`);
  }

  finalizeOrder(orderId: string): Observable<Order> {
    const updatedOrder = { status: 'FINALIZED' };  // The updated status
  
    // Make a PUT request to update the order status with a body
    return this.http.put<Order>(`${this.baseUrl}/orders-finalize/${orderId}`, updatedOrder);
  }

  getInactiveOrders(): Observable<Order>{
    return this.http.get<Order>(`${this.baseUrl}/orders`);
  }

}
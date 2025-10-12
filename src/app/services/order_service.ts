// src/app/services/order_service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Order } from '../models/order';
import { Observable } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private baseUrl = 'http://127.0.0.1:8000';
  constructor(private http: HttpClient) { }

  async onRegister(order: Order): Promise<any | null> {
    try {
        const response = await this.http.post(`${this.baseUrl}/orders/register`, order).toPromise();
        return response;
    } catch (error: any) {
        console.error('Error durante el registro:', error);
        return null;
    }
  }

  async addOrderItems(orderId: string, newItems: any[], total: string): Promise<boolean> {
    try {
      const body = { new_order_items: newItems, new_order_total: total };
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
    const updatedOrder = { status: 'FINALIZED' };
    return this.http.put<Order>(`${this.baseUrl}/orders/finalize/${orderId}`, updatedOrder);
  }

  assignOrderToTable(orderId: number, tableId: number): Observable<any> {
    return this.http.put<any>(`${this.baseUrl}/orders/assign-table/${orderId}/${tableId}`, null).pipe(
      tap(response => console.log('Response from API:', response)),
      catchError(error => {
        console.error('Error assigning order to table:', error);
        return throwError(error);
      })
    );
  }

  assignEmployeeToOrder(orderId: number, uid: string){
    const safeUid = encodeURIComponent(uid);
    return this.http.put<any>(`${this.baseUrl}/orders/assign-order-employee/${orderId}/${safeUid}`, {});
  }

  deleteOrderItems(orderId: string, orderItems: string[]) {
    return this.http.delete(`${this.baseUrl}/orders/delete-order-item/${orderId}`, {
      body: orderItems
    });
  }

  async applyTip(orderId: string, mode: 'percent' | 'absolute', value: number): Promise<any | null> {
    try {
      const body = { order_id: orderId, mode, value };
      const res = await this.http.post(`${this.baseUrl}/attendance/tips/apply`, body).toPromise();
      return res;
    } catch (error) {
      console.error('Error applying tip:', error);
      return null;
    }
  }
}

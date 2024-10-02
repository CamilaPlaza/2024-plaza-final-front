import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Table } from '../models/table';
import { Order } from '../models/order';

@Injectable({
  providedIn: 'root'
})
export class TableService {

  private baseUrl = 'https://two024-messidepaul-back.onrender.com';
  //private baseLocalUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) { }

  getTables(): Observable<{ message: { tables: Table[]; message: string } }> {
    return this.http.get<{ message: { tables: Table[]; message: string } }>(`${this.baseUrl}/tables`);
  }

  async updateTableAndOrder(order: any, orderId: number): Promise<boolean> { // Acepta el objeto de orden y el order_id
    try {
        console.log(order); // Verificas que tienes la orden completa
        
        // Actualizas la mesa con la orden completa (usa `order.tableNumber` y `orderId`)
        await this.http.put(`${this.baseUrl}/tables/order/${order.tableNumber}?order_id=${orderId}`, {}).toPromise();
        return true;
    } catch (error: any) {
        console.error('Error durante la actualización de la mesa:', error);
        return false;
    }
}

}
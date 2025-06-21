import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Table } from '../models/table';

@Injectable({
  providedIn: 'root'
})
export class TableService {

  //private baseUrl = 'https://candv-back.onrender.com';
  private baseUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) { }

  getTables(): Observable<{ message: { tables: Table[]; message: string } }> {
    return this.http.get<{ message: { tables: Table[]; message: string } }>(`${this.baseUrl}/tables`);
  }

  async updateTableAndOrder(order: any, orderId: number): Promise<boolean> {
    try {
        await this.http.put(`${this.baseUrl}/tables/order/${order.tableNumber}?order_id=${orderId}`, {}).toPromise();
        return true;
    } catch (error: any) {
        console.error('Error durante la actualización de la mesa:', error);
        return false;
    }
  }

  closeTable(table: Table): Observable<Table> {
    return this.http.put<Table>(`${this.baseUrl}/tables/close/${table.id}`, {status: "FINISHED", order_id: 0});
  }

  cleanTable(table: Table): Observable<Table> {
    return this.http.put<Table>(`${this.baseUrl}/tables/clean/${table.id}`, {status: "FREE", order_id: 0});
  }

}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Order } from '../models/order';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class OrderService {

  private baseUrl = 'https://two024-messidepaul-back.onrender.com';  // URL del backend
  //private baseLocalUrl = 'http://127.0.0.1:8000';
  constructor(private http: HttpClient) { }

  async onRegister(order: Order): Promise<boolean> {
    try {
      // Simplemente pasa el objeto `product` directamente en el post request
      await this.http.post(`${this.baseUrl}/register-order`, order).toPromise();
      return true;
    } catch (error: any) {
      console.error('Error durante el registro:', error);
      return false;
    }
  }

}
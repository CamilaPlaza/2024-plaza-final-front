import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../models/product';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private baseUrl = 'http://127.0.0.1:8000';  // URL del backend

  constructor(private http: HttpClient) { }

  async onRegister(product: Product): Promise<string> {
    try {
      // Simplemente pasa el objeto `product` directamente en el post request
      await this.http.post(`${this.baseUrl}/register-product`, product).toPromise();
      return "true";
    } catch (error: any) {
      console.error('Error durante el registro:', error);
      return "false";
    }
  }
  getProducts(): Observable<{ message: { products: Product[]; message: string } }> {
    return this.http.get<{ message: { products: Product[]; message: string } }>(`${this.baseUrl}/products`);
  }
  
}
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  //private baseUrl = 'https://candv-back.onrender.com';
  private baseUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) { }

  getCategoryRevenue(): Observable<any> {
    const endpoint = `${this.baseUrl}/categories/revenue`;
    return this.http.get<any>(endpoint);
  }
  getMonthlyRevenue(): Observable<any>{
    const endpoint = `${this.baseUrl}/charts/monthly-revenue`;
    return this.http.get<any>(endpoint);
  }
  getAveragePerPerson(year: string, month: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/charts/average_per_person/${year}/${month}`);
  }

  getAveragePerTicket(year: string, month: string): Observable<any> {
    return this.http.get<any>(`${this.baseUrl}/charts/averare_per_order/${year}/${month}`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ChartService {

  private baseUrl = 'https://two024-messidepaul-back.onrender.com';  // Replace with your backend URL

  constructor(private http: HttpClient) { }

  getCategoryRevenue(): Observable<any> {
    const endpoint = `${this.baseUrl}/category-revenue`;  // Construct the URL
    console.log(`Fetching category revenue from: ${endpoint}`);  // Log the URL
    return this.http.get<any>(endpoint);
  }
  getMonthlyRevenue(): Observable<any>{
    const endpoint = `${this.baseUrl}/monthly-revenue`;  // Construct the URL
    console.log(`Fetching category revenue from: ${endpoint}`);  // Log the URL
    return this.http.get<any>(endpoint);
  }
}

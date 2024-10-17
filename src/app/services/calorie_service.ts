import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class CalorieService {
  private baseUrl = 'https://candvbar-back.onrender.com';

  constructor(private http: HttpClient) {}

  // Obtener todas las comidas con calorías
  getCalories(): Observable<{ message: { food: any[] } }> {
    return this.http.get<{ message: { food: any[] } }>(`${this.baseUrl}/Foods/`);
  }
}

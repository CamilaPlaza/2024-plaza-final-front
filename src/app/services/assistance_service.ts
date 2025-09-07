import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class AssistanceService {
  private baseUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) {}

  checkIn(employee_id: string, shift_id: string, observations?: string) {
    const params = new HttpParams()
      .set('employee_id', employee_id)
      .set('shift_id', shift_id)
      .set('observations', observations || '');
    return this.http.post(`${this.baseUrl}/attendance/checkin`, null, { params });
  }

  checkOut(attendance_id: string) {
    return this.http.put(`${this.baseUrl}/attendance/checkout/${attendance_id}`, {});
  }

  getOpenAttendance(employee_id: string) {
    const params = new HttpParams().set('employee_id', employee_id);
    return this.http.get(`${this.baseUrl}/attendance/open-attendance`, { params });
  }

  getCurrentShiftId() {
    return this.http.get<{ shift_id: string }>(`${this.baseUrl}/shifts/current`);
  }
}

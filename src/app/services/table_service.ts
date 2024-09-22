import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Table } from '../models/table';

@Injectable({
  providedIn: 'root'
})
export class TableService {

  private baseUrl = 'http://127.0.0.1:8000';

  constructor(private http: HttpClient) { }

  getTables(): Observable<{ message: { tables: Table[]; message: string } }> {
    return this.http.get<{ message: { tables: Table[]; message: string } }>(`${this.baseUrl}/tables`);
  }
  
}
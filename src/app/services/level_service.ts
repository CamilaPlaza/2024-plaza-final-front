import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';


@Injectable({
  providedIn: 'root'
})

export class LevelService {
  private baseUrl = 'https://two024-plaza-final-back-4lpd.onrender.com';
  //private baseUrl = 'http://127.0.0.1:8000';
  constructor(private http: HttpClient) { }

  getLevel(levelId: string):Observable<string>{
    const endpoint = `${this.baseUrl}/users/level/${levelId}`;  // Construct the URL
    return this.http.get<string>(endpoint);
  }
}

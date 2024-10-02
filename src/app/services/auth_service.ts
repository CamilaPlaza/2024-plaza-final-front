import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { auth } from '../services/firebaseconfig';  // Import Firebase auth
import { User, onAuthStateChanged } from 'firebase/auth';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  constructor(private router: Router) {}
  
  currentUser: User | null = null;

  isAuthenticated(): Promise<boolean> {
    return new Promise((resolve) => {
      const token = localStorage.getItem('token');
      if (token) {
        onAuthStateChanged(auth, (user) => {
          if (user) {
            resolve(true);
          } else {
            resolve(false);
          }
        });
      } else {
        resolve(false);
      }
    });
  }
}

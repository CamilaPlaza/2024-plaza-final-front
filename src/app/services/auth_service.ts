import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { auth } from '../services/firebaseconfig';
import { User, onAuthStateChanged } from 'firebase/auth';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  currentUser: User | null = null;

  constructor(private router: Router) {
    onAuthStateChanged(auth, (user) => {
      this.currentUser = user;
    });
  }

  isAuthenticated(): Promise<boolean> {
    return new Promise((resolve) => {
      const token = localStorage.getItem('token');
      if (!token) return resolve(false);
      console.log(token);

      onAuthStateChanged(auth, (user) => {
        resolve(!!user);
      });
    });
  }

  handleTokenExpiration(): Observable<any> {
    return new Observable(observer => {
      const extend = window.confirm('Tu sesión ha expirado. ¿Querés extenderla?');

      if (extend) {
        auth.currentUser?.getIdToken(true)
          .then(newToken => {
            localStorage.setItem('token', newToken);
            observer.next(true);
            observer.complete();
          })
          .catch(() => {
            this.logout();
            observer.error('No se pudo renovar token');
          });
      } else {
        this.logout();
        observer.error('Sesión no renovada');
      }
    });
  }

  logout(): void {
    auth.signOut().then(() => {
      localStorage.removeItem('token');
      this.router.navigate(['/login']); // o donde vos mandes al usuario
    });
  }
}

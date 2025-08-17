import { Injectable } from '@angular/core';
import { CanActivate, ActivatedRouteSnapshot, RouterStateSnapshot, Router } from '@angular/router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from '../services/firebaseconfig';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Promise<boolean> {

    const publicRoutes = new Set([
      '',
      'login',
      'user-register',
      'user-forgot-password',
      'reset-password'
    ]);

    const path = route.routeConfig?.path ?? '';

    if (publicRoutes.has(path)) {
      return Promise.resolve(true);
    }

    return new Promise<boolean>((resolve) => {
      const unsub = onAuthStateChanged(auth, (user) => {
        unsub();
        if (user) {
          resolve(true);
        } else {
          this.router.navigate(['/login'], { queryParams: { redirectTo: state.url } });
          resolve(false);
        }
      });
    });
  }
}

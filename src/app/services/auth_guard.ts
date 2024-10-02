import { Injectable } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth_service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private authService: AuthService, private router: Router) {}

  canActivate(route: ActivatedRouteSnapshot): Observable<boolean> | Promise<boolean> | boolean {
    const publicRoutes = ['/user-register', '/user-forgot-password', '/reset-password'];
    const path = route.routeConfig?.path || '';  // Asigna un valor por defecto si path es undefined

    if (publicRoutes.includes(path)) {
      return true;  // Si la ruta es pública, permitir el acceso
    }

    return this.authService.isAuthenticated().then(isAuth => {
      if (!isAuth) {
        this.router.navigate(['/']);  // Redirige a la página de login si no está autenticado
        return false;
      }
      return true;
    });
  }
}

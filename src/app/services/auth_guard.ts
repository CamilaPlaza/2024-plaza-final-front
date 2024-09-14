/*import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';
import { UserService } from './user_service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {

  constructor(private userService: UserService, private router: Router) {}

  canActivate(): boolean {
    if (this.userService.isLoggedIn()) {
      return true;  // Permite el acceso al Home
    } else {
      this.router.navigate(['/']);  // Redirige al login si no está autenticado
      return false;  // Previene el acceso al Home
    }
  }
}*/

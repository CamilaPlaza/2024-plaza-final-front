import { Component, HostListener } from '@angular/core';
import { UserService } from 'src/app/services/user_service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  constructor(private userService: UserService, private router: Router) {}

  // Listener para el evento beforeunload (cuando el usuario intenta cerrar o recargar la página)
  @HostListener('window:beforeunload', ['$event'])
  unloadNotification(event: BeforeUnloadEvent): void {
    // Mostrar un mensaje de confirmación al salir
    event.returnValue = '¿Estás seguro que quieres terminar la sesión?';
  }

  // Listener para el evento de "atrás" del navegador
  @HostListener('window:popstate', ['$event'])
  onBackButton(event: PopStateEvent): void {
    const confirmLogout = confirm('¿Estás seguro que quieres terminar la sesión?');
    if (confirmLogout) {
      this.userService.signOut(); // Cerrar sesión
      this.router.navigate(['/']); // Redirigir al login
    } else {
      event.preventDefault(); // Evitar que el usuario vaya hacia atrás
    }
  }
}

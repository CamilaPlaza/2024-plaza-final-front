import { Component, HostListener } from '@angular/core';
import { UserService } from 'src/app/services/user_service';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent {

  constructor(public userService: UserService, private confirmationService: ConfirmationService, private router: Router) {}

  @HostListener('window:beforeunload', ['$event'])
  unloadNotification($event: any): void {
    // Cierra la sesión cuando se intenta cerrar la ventana o pestaña
    $event.returnValue = 'Are you sure you want to leave?';
    this.userService.logOut();
  }
  
  @HostListener('window:popstate', ['$event'])
  onPopState($event: any) {
    $event.returnValue = 'Are you sure you want to leave?';
    this.userService.logOut();
  }
}
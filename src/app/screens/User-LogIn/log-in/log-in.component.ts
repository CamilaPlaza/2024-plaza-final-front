import { Component, OnInit, HostListener  } from '@angular/core';
import { UserService } from 'src/app/services/user_service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.css'
})
export class LogInComponent implements OnInit {
  email: string = '';
  password: string = '';
  isMobile: boolean = window.innerWidth <= 800;
  displayForgotPasswordDialog: boolean = false;

  
  constructor(private userService: UserService, private router: Router) {}
  
  ngOnInit(): void {}

  async onLogin() {
    console.log('Email:', this.email);
    console.log('Password:', this.password);
  
    const loginSuccess = await this.userService.login(this.email, this.password);
  
    if (loginSuccess) {
      this.userService.handleAuthState();  // Gestiona la sesión
      this.router.navigate(['/home']);
    } else {
      console.error('Login failed');
      // Mostrar un mensaje de error al usuario
      // Puedes usar un servicio de notificaciones o un componente de alerta aquí
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = window.innerWidth <= 800;
  }

  showForgotPasswordDialog() {
    this.displayForgotPasswordDialog = true;
  }

  closeForgotPasswordDialog() {
    this.displayForgotPasswordDialog = false;
  }

}

import { Component, OnInit, HostListener  } from '@angular/core';
import { UserService } from 'src/app/services/user_service';
import { Router } from '@angular/router';
import { MessageService } from 'primeng/api';


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
  animateForm: boolean = false;

  
  constructor(private userService: UserService, private router: Router, private messageService: MessageService) {}
  
  ngOnInit(): void {}

  async onLogin() {
    this.router.navigate(['/home']);

    //const loginSuccess = await this.userService.login(this.email, this.password);
    /*const loginSuccess = true;
    if (loginSuccess) {
      //this.userService.handleAuthState();  // Gestiona la sesión
      this.router.navigate(['/home']);
    } else {
      console.error('Login failed');
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'No credentials were found', life: 3000 });
  
    }*/
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

  onSignUpClick() {
    // Activamos la animación
    this.animateForm = true;
    this.router.navigate(['/user-register']);

    // Después de 1 segundo (la duración de la animación), navegamos al registro
    /*setTimeout(() => {
      this.router.navigate(['/user-register']);
    }, 1000); */ // 1000ms = 1 segundo, coincidiendo con 'animation-duration-1000'
  }

}

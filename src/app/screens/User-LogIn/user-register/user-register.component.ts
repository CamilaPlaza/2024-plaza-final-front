import { Component, OnInit, HostListener } from '@angular/core';
import { User } from 'src/app/models/user';
import { ConfirmationService } from 'primeng/api';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user_service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-user-register',
  templateUrl: './user-register.component.html',
  styleUrls: ['./user-register.component.css'] // Cambié a styleUrls para que funcione correctamente
})
export class UserRegisterComponent implements OnInit {
  name: string = '';
  email: string = '';
  password: string = '';
  birthDate!: Date;
  user: User | undefined;
  isMobile: boolean = window.innerWidth <= 800;
  loading: boolean = false;
  animateForm: boolean = false;

  ngOnInit(): void {}

  constructor(
    private userService: UserService,
    private confirmationService: ConfirmationService,
    private router: Router,
    private messageService: MessageService
  ) {}


  async onRegister(event: Event) {
    this.loading = true;
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure that you want to proceed?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          const response = await this.userService.onRegister(this.email, this.password, this.name, this.birthDate)
          console.log('Register successful', response);
          this.messageService.add({ severity: 'info', summary: 'Success', detail: 'Registration successfully' });
          this.router.navigate(['/home']);
    
        } catch (error: any) {
          console.error('Register failed', error);
          this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occurred during registration', life: 3000 });
        }
      }
    });

    setTimeout(() => {
      this.loading = false
    }, 2000);
  }
 

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = window.innerWidth <= 800;
  } 

  onLogInClick() {
    // Activamos la animación
    this.animateForm = true;

    // Después de 1 segundo (la duración de la animación), navegamos al registro
    setTimeout(() => {
      this.router.navigate(['/']);
    }, 1000);  // 1000ms = 1 segundo, coincidiendo con 'animation-duration-1000'
  }

}

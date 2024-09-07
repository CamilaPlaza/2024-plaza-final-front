import { Component, OnInit, HostListener } from '@angular/core';
import { User } from 'src/app/models/user';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user_service';

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

  ngOnInit(): void {}

  constructor(
    private userService: UserService,
    private confirmationService: ConfirmationService, 
    private messageService: MessageService, 
    private router: Router
  ) {}



  async onRegister(event: Event) {
    this.confirmationService.confirm({
      target: event.target as EventTarget,
      message: 'Are you sure that you want to proceed?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          const response = await this.userService.onRegister(this.email, this.password, this.name, this.birthDate)
          console.log('Register successful', response);
          this.router.navigate(['/']);
    
        } catch (error: any) {
          console.error('Register failed', error);
        }
      }
    });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = window.innerWidth <= 800;
  } 
}

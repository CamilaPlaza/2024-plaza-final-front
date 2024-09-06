import { Component, OnInit, HostListener } from '@angular/core';
import { User } from 'src/app/models/user';
import { ConfirmationService, MessageService } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-register',
  templateUrl: './user-register.component.html',
  styleUrl: './user-register.component.css'
})
export class UserRegisterComponent implements OnInit {
  name: string = '';
  email: string = '';
  password: string = '';
  birthDate!: Date;
  user: User | undefined;
  isMobile: boolean = window.innerWidth <= 800;

  ngOnInit(): void {}

  constructor(private confirmationService: ConfirmationService, private messageService: MessageService, private router: Router ) {}

  confirm1(event: Event) {
      this.confirmationService.confirm({
          target: event.target as EventTarget,
          message: 'Are you sure that you want to proceed?',
          header: 'Confirmation',
          icon: 'pi pi-exclamation-triangle',
          accept: () => {
            this.router.navigate(['/']);
          }
      });
  }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = window.innerWidth <= 800;
  } 

  onRegister(){
    this.user = new User(this.name, this.email,this.password, this.birthDate.toString());
    console.log('USER: ', this.user);
  }

}

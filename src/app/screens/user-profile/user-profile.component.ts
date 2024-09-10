import { Component, OnInit, HostListener } from '@angular/core';
import { ConfirmationService } from 'primeng/api';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user_service';


@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit{

  name: string = 'Camila Plaza';
  email: string = 'camilaplaza12@gmail.com';
  birthday: string = '12/02/2001';

  constructor(private confirmationService: ConfirmationService,
    private router: Router,
    private userService: UserService){}

  ngOnInit(): void {}

  async onDeleteAccount() {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to delete your account?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        this.userService.deleteCurrentUser()
          .then(() => {
            console.log('Account deleted successfully');
            // Aquí puedes agregar lógica adicional, como redireccionar a otra página
          })
          .catch(error => {
            console.error('Error deleting account:', error);
          });
      }
    });
  }

  async changePassword() {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to change your password?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        console.log('cambiamos');
      }
    });
  }

  
}

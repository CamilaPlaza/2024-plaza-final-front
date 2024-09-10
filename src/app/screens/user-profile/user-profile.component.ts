import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user_service';
import { ConfirmationService, MessageService } from 'primeng/api';


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
    private userService: UserService,
    private messageService: MessageService){}

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
            this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'You have accepted' });
          })
          .catch(error => {
            console.error('Error deleting account:', error);
            this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error ocurred', life: 3000 });
          });
      },
      reject: () => {
        this.messageService.add({ severity: 'secondary', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
      }
    });
  }

  async changePassword() {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to change your password?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'A email was send it to you' });
      },
      reject: () => {
        this.messageService.add({ severity: 'secondary', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
      }

    });
  }

  
}

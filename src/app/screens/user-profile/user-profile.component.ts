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

  email: string | null = null;
  name: string | null = null;
  birthday: Date | null = null;

  constructor(private confirmationService: ConfirmationService,
    private router: Router,
    private userService: UserService,
    private messageService: MessageService,
    ){}
    async ngOnInit(): Promise<void> {
      const user = this.userService.currentUser;
      if (user) {
        this.email = user.email; 
  
        (await this.userService.getUserDataFromFirestore(user.uid)).subscribe(
          (userData) => {
            this.name = userData.name;         // Nombre del usuario desde Firestore
            this.birthday = userData.birthday; // Cumpleaños del usuario desde Firestore
          },
          (error) => {
            console.error('Error fetching user data:', error);
          }
        );
      } else {
        this.router.navigate(['/']); // Redirigir al login si no está autenticado
      }
    }

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
            setTimeout(() => {
              this.router.navigate(['/']); // Navegar después de un retraso
            }, 2000);
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
        this.userService.resetPassword(this.email ?? '');
        this.messageService.add({ severity: 'info', summary: 'Confirmed', detail: 'A email was send it to you' });

      },
      reject: () => {
        this.messageService.add({ severity: 'secondary', summary: 'Rejected', detail: 'You have rejected', life: 3000 });
      }

    });
  }

  
}

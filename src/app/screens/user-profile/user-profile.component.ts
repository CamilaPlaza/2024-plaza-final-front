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
  displayConfirmDeleteDialog: boolean = false;
  displayErrorDialog: boolean = false;
  displayChangePasswordDialog: boolean = false;

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
            this.name = userData.name;        
            this.birthday = userData.birthday;
          },
          (error) => {
            console.error('Error fetching user data:', error);
          }
        );
      } else {
        this.router.navigate(['/']); 
      }
    }

  async onDeleteAccount() {
    this.userService.deleteCurrentUser()
    .then(() => {
      console.log('Account deleted successfully');
      setTimeout(() => {
        this.router.navigate(['/']); 
      }, 2000);
    })
    .catch(error => {
      console.error('Error deleting account:', error);
      this.showErrorDialog();
    });
  }

  async changePassword() {
    this.userService.resetPassword(this.email ?? '');
    this.userService.logOut().then(() => {
      localStorage.removeItem("token");
      this.router.navigate(['/']);  // Redirigir al login
  });
  }

  showChangePasswordDialog() {
    this.displayChangePasswordDialog = true;
  }

  closeChangePasswordDialog() {
    this.displayChangePasswordDialog = false;
  }
    
  showConfirmDeleteDialog() {
    this.displayConfirmDeleteDialog = true;
  }

  closeConfirmDeleteDialog() {
    this.displayConfirmDeleteDialog = false;
  }

  showErrorDialog() {
    this.closeConfirmDeleteDialog();
    this.displayErrorDialog = true;
  }

  closeErrorDialog() {
    this.displayErrorDialog = false;
  }

  
}

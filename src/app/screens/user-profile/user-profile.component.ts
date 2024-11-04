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
  displayDiscountDialog = false;
  selectedReward: any;
  responsiveOptions: any[] | undefined;
  userName = 'John Doe'; 
  userLevel = 'Croissant';
  rewards = [
    { name: 'Reward 1', imageUrl: '../../../assets/images/goals.jpg', discountCode: 'DISCOUNT1' },
    { name: 'Reward 2', imageUrl: '../../../assets/images/goals.jpg', discountCode: 'DISCOUNT2' },
    { name: 'Reward 3', imageUrl: '../../../assets/images/goals.jpg', discountCode: 'DISCOUNT3' },
  ];
  

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
      this.responsiveOptions = [
        {
            breakpoint: '1400px',
            numVisible: 3,
            numScroll: 3
        },
        {
            breakpoint: '1220px',
            numVisible: 2,
            numScroll: 2
        },
        {
            breakpoint: '1100px',
            numVisible: 1,
            numScroll: 1
        }
    ];
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

  showDiscountCode(reward: any) {
    this.selectedReward = reward;
    this.displayDiscountDialog = true;
  }
  
}

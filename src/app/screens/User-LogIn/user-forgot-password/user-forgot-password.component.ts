import { Component, Output, EventEmitter } from '@angular/core';
import { UserService } from 'src/app/services/user_service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-user-forgot-password',
  templateUrl: './user-forgot-password.component.html',
  styleUrl: './user-forgot-password.component.css'
})
export class UserForgotPasswordComponent {
  email: string = '';
  visible: boolean = false;
  @Output() onClose = new EventEmitter<void>();


  constructor(private userService: UserService, private messageService: MessageService) {}

  async onForgotPassword() {
    try {
      const response = await this.userService.resetPassword(this.email);
      console.log('Reset successful', response);
      this.messageService.add({ severity: 'info', summary: 'Success', detail: 'An email was sent to you' });
  
      this.closeDialog();

    } catch (error: any) {
      console.error('Reset failed', error);
      this.messageService.add({ severity: 'error', summary: 'Error', detail: 'An error occurred', life: 3000 });
        
    }
    
  }

  closeDialog() {
    this.onClose.emit();
  }

}

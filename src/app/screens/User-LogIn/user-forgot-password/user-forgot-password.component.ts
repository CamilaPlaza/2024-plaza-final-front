import { Component, Output, EventEmitter } from '@angular/core';
import { UserService } from 'src/app/services/user_service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-user-forgot-password',
  templateUrl: './user-forgot-password.component.html',
  styleUrl: './user-forgot-password.component.css'
})
export class UserForgotPasswordComponent {
  email: string = '';
  visible: boolean = false;
  @Output() onClose = new EventEmitter<void>();


  constructor(private userService: UserService, private router: Router) {}

  async onForgotPassword() {
    try {
      const response = await this.userService.resetPassword(this.email);
      console.log('Reset successful', response);
      this.closeDialog();

    } catch (error: any) {
      console.error('Reset failed', error);
    }
  }

  closeDialog() {
    this.onClose.emit();
  }

}

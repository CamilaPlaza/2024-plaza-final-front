import { Component } from '@angular/core';
import { getAuth, confirmPasswordReset } from 'firebase/auth';
import { Router } from '@angular/router';


@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  styleUrls: ['./reset-password.component.css'],
})
export class ResetPasswordComponent {
  email: string = '';
  newPassword: string = '';  // This is bound to the input field for the new password
  oobCode: string = '';      // Stores the code from the URL (required for resetting password)
  errorMessage: string = '';  // Displays error messages
  successMessage: string = ''; // Displays success message
  passwordValid = {
    lowercase: false,
    uppercase: false,
    numeric: false,
    minLength: false
  };
  displayConfirmDialog: boolean = false;
  displayErrorDialog: boolean = false;
  constructor(private router: Router) {
    // Get the oobCode from the URL when the component is initialized
    const urlParams = new URLSearchParams(window.location.search);
    this.oobCode = urlParams.get('oobCode') || ''; // Fallback to empty string if no code
  }

  async confirmPasswordReset() {
    try {
      const auth = getAuth();
      // Call Firebase's confirmPasswordReset method
      await confirmPasswordReset(auth, this.oobCode, this.newPassword);
      this.successMessage = 'Password reset successful!';
      this.errorMessage = ''; // Clear any previous error messages
      this.router.navigate(['/login']);
    } catch (error: any) {
      this.errorMessage = 'Error resetting password: ' + error.message;
      this.successMessage = ''; // Clear any previous success messages
    }
  }
  validatePassword() {
    const password = this.newPassword || '';

    // Validaciones
    this.passwordValid.lowercase = /[a-z]/.test(password);
    this.passwordValid.uppercase = /[A-Z]/.test(password);
    this.passwordValid.numeric = /[0-9]/.test(password);
    this.passwordValid.minLength = password.length >= 8;
  }

  isPasswordValid(): boolean {
    return this.passwordValid.lowercase && 
           this.passwordValid.uppercase && 
           this.passwordValid.numeric && 
           this.passwordValid.minLength;
  }
  areAllFieldsFilled(): boolean {
    return this.newPassword.trim() !== '' && 
           this.isPasswordValid();
  }
  
  showConfirmDialog() {
    this.displayConfirmDialog = true;
  }

  closeConfirmDialog() {
    this.displayConfirmDialog = false;
  }

  showErrorDialog() {
    this.displayErrorDialog = true;
  }

  closeErrorDialog() {
    this.displayErrorDialog = false;
  }
}

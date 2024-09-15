import { Component, OnInit, HostListener } from '@angular/core';
import { UserData } from 'src/app/models/user';
import { ConfirmationService } from 'primeng/api';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user_service';
import { MessageService } from 'primeng/api';
import { DatePipe } from '@angular/common';


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
  user: UserData | undefined;
  isMobile: boolean = window.innerWidth <= 800;
  loading: boolean = false;
  animateForm: boolean = false;
  passwordValid = {
    lowercase: false,
    uppercase: false,
    numeric: false,
    minLength: false
  };
  formattedBirthDate: string = '';
  displayConfirmDialog: boolean = false;
  displayErrorDialog: boolean = false;
  maxDate: Date = new Date();

  ngOnInit(): void {}

  constructor(
    private userService: UserService,
    private router: Router,
    private datePipe: DatePipe
  ) {}


  async onRegister() {
    try {
      //CHEQUEO DE SI SALE BIEN
      this.closeConfirmDialog();
      this.loading = true;
      this.formattedBirthDate = this.datePipe.transform(this.birthDate, 'dd/MM/yyyy') || '';
      console.log(this.formattedBirthDate);
                
      const response = await this.userService.onRegister(this.email, this.password, this.name, this.formattedBirthDate)
      setTimeout(() => {
        this.router.navigate(['/home']);
      }, 2000);
    
    } catch (error: any) {
      console.error('Register failed', error);
      this.showErrorDialog();    
    } finally {
      this.loading = false;
    }

    setTimeout(() => {
      this.loading = false;
    }, 2000);
}


  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = window.innerWidth <= 800;
  } 

  onLogInClick() {
    this.router.navigate(['/']);
  }

  validatePassword() {
    const password = this.password || '';

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
    return this.name.trim() !== '' && 
           this.email.trim() !== '' && 
           this.password.trim() !== '' && 
           this.birthDate !== undefined && 
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

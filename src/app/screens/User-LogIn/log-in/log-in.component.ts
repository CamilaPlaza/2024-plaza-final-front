import { Component, OnInit, HostListener  } from '@angular/core';
import { UserService } from 'src/app/services/user_service';
import { Router } from '@angular/router';


@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.css'
})
export class LogInComponent implements OnInit {
  email: string = '';
  password: string = '';
  isMobile: boolean = window.innerWidth <= 800;
  displayForgotPasswordDialog: boolean = false;

  
  constructor(private userService: UserService, private router: Router) {}
  
  ngOnInit(): void {
  }

    async onLogin() {
      console.log('Email:', this.email);
      console.log('Password:', this.password);
          
      try {
        const response = await this.userService.login(this.email, this.password);
        console.log('Login successful', response);
        this.router.navigate(['/home']);

      } catch (error: any) {
        console.error('Login failed', error);
      }
    }

  @HostListener('window:resize', ['$event'])
  onResize(event: any) {
    this.isMobile = window.innerWidth <= 800;
  }

  showForgotPasswordDialog() {
    this.displayForgotPasswordDialog = true;
  }

  closeForgotPasswordDialog() {
    this.displayForgotPasswordDialog = false;
  }

}

import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user_service';
import { User } from 'src/app/models/user';
import { Router } from '@angular/router';


@Component({
  selector: 'app-log-in',
  templateUrl: './log-in.component.html',
  styleUrl: './log-in.component.css'
})
export class LogInComponent implements OnInit {
  email: string = '';
  password: string = '';
  constructor(private userService: UserService, private router: Router) {}

  ngOnInit(): void {
  }

    async onLogin() {
      console.log('Email:', this.email);
      console.log('Password:', this.password);
      const user = new User(this.email, this.password);
    
      try {
        const response = await this.userService.login(user);
        console.log('Login successful', response);
        this.router.navigate(['/user-register']);

      } catch (error: any) {
        console.error('Login failed', error);
      }
    }
    
}
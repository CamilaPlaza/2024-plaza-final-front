import { Component, OnInit } from '@angular/core';
import { UserService } from 'src/app/services/user_service';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  email: string = '';
  password: string = '';

  constructor(private userService: UserService) {}

  ngOnInit(): void {
  }

  onLogin() {
    const user = new User(this.email, this.password);
    this.userService.login(user).subscribe(
      response => {
        console.log('Login successful', response);
      },
      error => {
        console.error('Login failed', error);
      }
    );
  }
}

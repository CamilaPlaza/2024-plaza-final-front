import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from './services/auth_service';

@Component({
  selector: 'pm-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  showHeader: boolean = true;
  isAuthenticated: boolean | null = null;
  constructor(private router: Router, private authService: AuthService) {
    this.router.events.subscribe((event) => {
      if (this.router.url === '/' || this.router.url === '/user-register' || this.router.url === '/user-forgot-password') {
        this.showHeader = false;
      } else {
        this.showHeader = true;
      }
    });
  }
  ngOnInit() {
    this.authService.isAuthenticated().then((authStatus) => {
      this.isAuthenticated = authStatus;
    });
  }

}




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
    this.router.events.subscribe(() => {
      const publicRoutes = ['/', '/user-register', '/user-forgot-password', '/reset-password'];
      if (publicRoutes.includes(this.router.url)) {
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




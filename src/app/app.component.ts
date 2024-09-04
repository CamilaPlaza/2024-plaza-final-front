import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'pm-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  showHeader: boolean = true;

  constructor(private router: Router) {
    this.router.events.subscribe((event) => {
      if (this.router.url === '/' || this.router.url === '/user-register') {
        this.showHeader = false;
      } else {
        this.showHeader = true;
      }
    });
  }
}



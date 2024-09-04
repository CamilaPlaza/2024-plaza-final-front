import { Component } from '@angular/core';
import { NavigationEnd, Router } from '@angular/router';

@Component({
  selector: 'pm-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'APM-New';
  showBackgroundImage: boolean = false;
  constructor(private router: Router) { }

  ngOnInit() {
    this.router.events.subscribe((event) => {
      if (event instanceof NavigationEnd) {
        this.showBackgroundImage = (event.urlAfterRedirects === '/');
      }
    });
  }

  onRouterOutletActivate(component: any) {
    // Aquí puedes realizar alguna lógica adicional si es necesario
  }
}



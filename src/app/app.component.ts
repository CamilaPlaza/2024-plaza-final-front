import { Component, OnInit } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { onAuthStateChanged } from 'firebase/auth';
import { auth } from './services/firebaseconfig';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'pm-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css'],
})
export class AppComponent implements OnInit {
  isLoggedIn = false;
  isPublicRoute = true;

  private publicRoutes = new Set([
    '',
    'login',
    'user-register',
    'user-forgot-password',
    'reset-password',
    'menu-order',
  ]);

  constructor(private router: Router) {}

  ngOnInit(): void {
    onAuthStateChanged(auth, (user) => {
      this.isLoggedIn = !!user;
    });

    this.router.events
      .pipe(filter((e) => e instanceof NavigationEnd))
      .subscribe(() => {
        const path = this.router.url.replace(/^\//, ''); // sin leading slash
        const firstSeg = path.split('?')[0].split('/')[0]; // primer segmento
        this.isPublicRoute = this.publicRoutes.has(firstSeg);
      });
  }

  get showShell(): boolean {
    return this.isLoggedIn && !this.isPublicRoute;
  }
}

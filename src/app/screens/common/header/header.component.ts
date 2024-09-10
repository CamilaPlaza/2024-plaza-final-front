import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
    items: MenuItem[] | undefined;

    constructor(private router: Router) { }

    ngOnInit(): void {
        this.items = [
            {
                icon: 'pi pi-fw pi-home',
                routerLink: '/home',
                tooltip: 'Home'
            },
            {
                icon: 'pi pi-fw pi-pencil',
                items: [
                    {
                        label: 'New Product',
                        routerLink: '/register-product'
                    },
                    {
                        label: 'View Products',
                        routerLink: '/products-view'
                    }
                ]
            },
            {
                icon: 'pi pi-fw pi-dollar',
                tooltip: 'Expenses'
            },
            {
                icon: 'pi pi-fw pi-calendar',
                routerLink: '/calendar',
                tooltip: 'Calendar'
            },
            {
                icon: 'pi pi-fw pi-user-edit',
                items: [
                    {
                        label: 'Edit',
                        routerLink: '/user-profile'
                    },
                    {
                        label: 'Quit',
                        command: () => this.logout() // Agrega una acción si es necesario
                    }
                ]
            }
        ];
    }

    logout() {
        // Acción para el cierre de sesión
        this.router.navigate(['/login']);
    }
}

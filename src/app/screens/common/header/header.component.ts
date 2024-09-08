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
                label: 'Home',
                icon: 'pi pi-fw pi-home',
                routerLink: '/home'
            },
            {
                label: 'Products',
                icon: 'pi pi-fw pi-user-edit',
                items: [
                    {
                        label: 'Register Products',
                        icon: 'pi pi-fw pi-pencil',
                        routerLink: '/register-product'
                    },
                    {
                        label: 'View Products',
                        icon: 'pi pi-fw pi-pencil',
                        routerLink: '/products-view'
                    }
                ]
            },
            {
                label: 'Expenses',
                icon: 'pi pi-fw pi-dollar',
                items: [
                    {
                        label: 'Total expenses',
                        icon: 'pi pi-fw pi-money-bill',
                        routerLink: '/total-expenses'  // Agrega la ruta si existe
                    },
                    {
                        label: 'Suppliers',
                        icon: 'pi pi-fw pi-users',
                        routerLink: '/suppliers'  // Agrega la ruta si existe
                    },
                    {
                        label: 'Maintenance',
                        icon: 'pi pi-fw pi-wrench',
                        routerLink: '/maintenance'  // Agrega la ruta si existe
                    }
                ]
            },
            {
                label: 'Calendar',
                icon: 'pi pi-fw pi-calendar',
                routerLink: '/calendar'
            },
            {
                label: 'Profile',
                icon: 'pi pi-fw pi-user-edit',
                items: [
                    {
                        label: 'Edit',
                        icon: 'pi pi-fw pi-pencil',
                        routerLink: '/user-profile'
                    },
                    {
                        label: 'Quit',
                        icon: 'pi pi-fw pi-power-off',
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

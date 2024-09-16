import { Component, OnInit } from '@angular/core';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user_service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
    items: MenuItem[] | undefined;
    displayConfirmDialog: boolean = false;

    constructor(private router: Router, public userService: UserService, private confirmationService: ConfirmationService) { }

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
                //routerLink: '/calendar',
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
                        command: () => this.showConfirmDialog(),
                    }
                ]
            }
        ];
    }
    logOut() {
        this.userService.logOut().then(() => {
            this.router.navigate(['/']);  // Redirigir al login
        });     
    }
    showConfirmDialog() {
        this.displayConfirmDialog = true;
      }
    
      closeConfirmDialog() {
        this.displayConfirmDialog = false;
      }
}
    







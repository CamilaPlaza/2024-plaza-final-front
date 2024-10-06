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
                icon: 'fa fa-cutlery',
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
                icon: 'pi pi-receipt',
                routerLink: '/tables',
                tooltip: 'Tables'
            },
            {
                icon: 'pi pi-file-check',
                routerLink: '/orders',
                tooltip: 'Orders'
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
            localStorage.removeItem("token");
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
    







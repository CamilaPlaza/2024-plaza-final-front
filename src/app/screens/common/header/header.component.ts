import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';
import { Router } from '@angular/router';
import { UserService } from 'src/app/services/user_service';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
    items: MenuItem[] | undefined;

    constructor(private router: Router, public userService: UserService) { }

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
                        command: () => this.logout(),
                    }
                ]
            }
        ];
    }
    async logout(){
    this.userService.logOut()
          .then(() => {
            this.router.navigate(['/']); 
          })
    }
}

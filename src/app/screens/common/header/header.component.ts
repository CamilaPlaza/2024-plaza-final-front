import { Component, OnInit } from '@angular/core';
import { MenuItem } from 'primeng/api';

@Component({
    selector: 'app-header',
    templateUrl: './header.component.html',
    styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {
    items: MenuItem[] | undefined;

    constructor() { }

    ngOnInit(): void {
        this.items = [
            {
                label: 'Home',
                icon: 'pi pi-fw pi-home'
            },
            {
                label: 'Register',
                icon: 'pi pi-fw pi-user-edit',
                items: [
                    {
                        label: 'New Products',
                        icon: 'pi pi-fw pi-pencil'
                    }
                ]
            },
            {
                label: 'Expenses',
                icon: 'pi pi-fw pi-dollar',
                items: [
                    {
                        label: 'Total expenses',
                        icon: 'pi pi-fw pi-money-bill'
                    },
                    {
                        label: 'Suppliers',
                        icon: 'pi pi-fw pi-users'
                    },
                    {
                        label: 'Maintenance',
                        icon: 'pi pi-fw pi-wrench'
                    }
                ]
            },
            {
                label: 'Calendar',
                icon: 'pi pi-fw pi-calendar',
            },
            {
                label: 'Quit',
                icon: 'pi pi-fw pi-power-off'
            }
        ];
    }

 }

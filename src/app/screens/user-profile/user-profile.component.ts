import { Component, OnInit, HostListener } from '@angular/core';
import { Product } from 'src/app/models/product';
import { ConfirmationService } from 'primeng/api';
import { Router } from '@angular/router';


@Component({
  selector: 'app-user-profile',
  templateUrl: './user-profile.component.html',
  styleUrl: './user-profile.component.css'
})
export class UserProfileComponent implements OnInit{

  name: string = 'Camila Plaza';
  email: string = 'camilaplaza12@gmail.com';
  birthday: string = '12/02/2001';

  constructor(private confirmationService: ConfirmationService,
    private router: Router){}

  ngOnInit(): void {}

  async onRegister() {
    this.confirmationService.confirm({
      message: 'Are you sure that you want to proceed?',
      header: 'Confirmation',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        try {
          console.log('Register successful');
          this.router.navigate(['/products-view']);
    
        } catch (error: any) {
          console.error('Register failed', error);
        }
      }
    });
  }
}

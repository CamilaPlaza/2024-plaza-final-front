import { Component, OnInit } from '@angular/core';
import { User } from 'src/app/models/user';

@Component({
  selector: 'app-user-register',
  templateUrl: './user-register.component.html',
  styleUrl: './user-register.component.css'
})
export class UserRegisterComponent implements OnInit {
  name: string = '';
  email: string = '';
  password: string = '';
  birthDate!: Date;
  user: User | undefined;

  ngOnInit(): void {
    
  }
  

  onRegister(){
    this.user = new User(this.name, this.email,this.password, this.birthDate.toString());
    console.log('USER: ', this.user);
  }

}

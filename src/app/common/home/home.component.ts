
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { PasswordModule } from 'primeng/password';
import { DividerModule } from 'primeng/divider';
import { InputTextModule } from 'primeng/inputtext';
import { FloatLabelModule } from 'primeng/floatlabel';
import { ButtonModule } from 'primeng/button';
import { InputIconModule } from 'primeng/inputicon';
import { IconFieldModule } from 'primeng/iconfield';


@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css'],
  standalone: true,
  imports: [FormsModule, DividerModule, PasswordModule, InputIconModule, IconFieldModule, InputTextModule, FloatLabelModule, ButtonModule] 
})
export class HomeComponent {
  username: string = '';
  password: string = '';

  onLogin() {
    console.log('Username:', this.username);
    console.log('Password:', this.password);
  }
}

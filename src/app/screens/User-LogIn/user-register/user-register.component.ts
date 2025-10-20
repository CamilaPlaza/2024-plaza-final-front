import { Component, OnInit, HostListener } from '@angular/core';
import { Router } from '@angular/router';
import { UserService } from '../../../services/user_service';
import { DatePipe } from '@angular/common';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-user-register',
  templateUrl: './user-register.component.html',
  styleUrls: ['./user-register.component.css'],
  providers: [MessageService]
})
export class UserRegisterComponent implements OnInit {
  name: string = '';
  email: string = '';
  password: string = '';
  birthDate!: Date;
  fileName: string = '';
  imageUrl: string = '';
  isMobile: boolean = window.innerWidth <= 800;
  loading: boolean = false;
  passwordValid = { lowercase: false, uppercase: false, numeric: false, minLength: false };
  formattedBirthDate: string = '';
  displayConfirmDialog: boolean = false;
  displayErrorDialog: boolean = false;
  maxDate: Date = new Date();
  selectedShift: string = '';
  readonly MAX_IMAGE_BYTES = 1000000;
  emailTouched: boolean = false;

  constructor(
    private userService: UserService,
    private router: Router,
    private datePipe: DatePipe,
    private messageService: MessageService
  ) {}

  ngOnInit(): void {
    localStorage.removeItem('token');
  }

  onAvatarClick(inputEl: HTMLInputElement) {
    inputEl.click();
  }

  onAvatarChange(event: Event) {
    const input = event.target as HTMLInputElement;
    const file = input?.files?.[0];
    if (!file) return;
    if (file.size > this.MAX_IMAGE_BYTES) {
      this.toastError(`Image is too large (${(file.size / 1024).toFixed(0)} KB). Max: ${(this.MAX_IMAGE_BYTES/1024).toFixed(0)} KB.`);
      input.value = '';
      return;
    }
    this.fileName = file.name;
    const reader = new FileReader();
    reader.onload = (e: any) => {
      this.imageUrl = e.target.result;
    };
    reader.readAsDataURL(file);
  }

  clearAvatar(ev?: Event) {
    if (ev) ev.stopPropagation();
    this.fileName = '';
    this.imageUrl = '';
  }

  setShift(value: 'mañana' | 'tarde' | 'noche') {
    this.selectedShift = value;
  }

  async onRegister() {
    try {
      this.closeConfirmDialog();
      this.loading = true;
      this.formattedBirthDate = this.datePipe.transform(this.birthDate, 'dd/MM/yyyy') || '';
      const ok = await this.userService.onRegister(
        this.email,
        this.password,
        this.name,
        this.formattedBirthDate,
        this.imageUrl,
        this.selectedShift
      );
      if (ok) {
        await this.userService.login(this.email, this.password);
        this.router.navigate(['/home']);
      }
    } catch (error: any) {
      this.showErrorDialog();
    } finally {
      this.loading = false;
    }
  }

  @HostListener('window:resize', ['$event'])
  onResize(_: any) { this.isMobile = window.innerWidth <= 800; }

  validatePassword() {
    const p = this.password || '';
    this.passwordValid.lowercase = /[a-z]/.test(p);
    this.passwordValid.uppercase = /[A-Z]/.test(p);
    this.passwordValid.numeric = /[0-9]/.test(p);
    this.passwordValid.minLength = p.length >= 8;
  }

  isPasswordValid(): boolean {
    return this.passwordValid.lowercase &&
           this.passwordValid.uppercase &&
           this.passwordValid.numeric &&
           this.passwordValid.minLength;
  }

  onEmailChange(v: string) {
    this.email = v;
    this.emailTouched = true;
  }

  isEmailValid(): boolean {
    const e = this.email.trim();
    return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e);
  }

  areAllFieldsFilled(): boolean {
    return this.name.trim() !== '' &&
           this.email.trim() !== '' &&
           this.isEmailValid() &&
           this.password.trim() !== '' &&
           this.birthDate !== undefined &&
           this.selectedShift !== '' &&
           this.isPasswordValid();
  }

  showConfirmDialog() { this.displayConfirmDialog = true; }
  closeConfirmDialog() { this.displayConfirmDialog = false; }
  showErrorDialog() { this.displayErrorDialog = true; }
  closeErrorDialog() { this.displayErrorDialog = false; }

  private toastError(detail: string) {
    this.messageService.add({
      severity: 'error',
      summary: 'Upload error',
      detail,
      life: 4000
    });
  }
}

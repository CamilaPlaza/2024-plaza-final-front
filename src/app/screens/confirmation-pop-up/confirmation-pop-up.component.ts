import { Component, Output, EventEmitter, Input  } from '@angular/core';
import { UserService } from 'src/app/services/user_service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'app-confirmation-pop-up',
  templateUrl: './confirmation-pop-up.component.html',
  styleUrl: './confirmation-pop-up.component.css'
})
export class ConfirmationPopUpComponent {
  @Input() subtitle: string = ''; 
  visible: boolean = false;
  @Output() onClose = new EventEmitter<void>();


  constructor(private userService: UserService, private messageService: MessageService) {}

  sendConfirmation(){

  }

  closeDialog() {
    this.onClose.emit();
  }

}

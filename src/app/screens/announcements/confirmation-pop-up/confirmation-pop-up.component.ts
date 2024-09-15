import { Component, Output, EventEmitter, Input  } from '@angular/core';


@Component({
  selector: 'app-confirmation-pop-up',
  templateUrl: 'confirmation-pop-up.component.html',
  styleUrl: 'confirmation-pop-up.component.css'
})
export class ConfirmationPopUpComponent {
  @Input() subtitle: string = ''; 
  @Output() onClose = new EventEmitter<void>();
  @Output() onSend = new EventEmitter<void>(); 


  constructor() {}

  sendConfirmation(){
    this.onSend.emit();    
  }

  closeDialog() {
    this.onClose.emit();
  }

}

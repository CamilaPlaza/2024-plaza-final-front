import { Component, Output, EventEmitter, Input } from '@angular/core';

@Component({
  selector: 'app-confirmation-pop-up',
  templateUrl: 'confirmation-pop-up.component.html',
  styleUrls: ['confirmation-pop-up.component.css'] // Cambié `styleUrl` a `styleUrls` para que sea correcto
})
export class ConfirmationPopUpComponent {
  @Input() subtitle: string = '';
  @Input() cancelLabel: string = 'Cancel'; // Texto por defecto del botón de cancelar
  @Input() sendLabel: string = 'Send';     // Texto por defecto del botón de enviar
  
  @Output() onClose = new EventEmitter<void>();
  @Output() onSend = new EventEmitter<void>();

  constructor() {}

  sendConfirmation() {
    this.onSend.emit();
  }

  closeDialog() {
    this.onClose.emit();
  }
}

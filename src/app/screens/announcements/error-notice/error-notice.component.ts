import { Component, Output, EventEmitter, Input  } from '@angular/core';

@Component({
  selector: 'app-error-notice',
  templateUrl: './error-notice.component.html',
  styleUrl: './error-notice.component.css'
})
export class ErrorNoticeComponent {
  @Input() subtitle: string = ''; 
  @Output() onClose = new EventEmitter<void>();


  constructor() {}

  closeDialog() {
    this.onClose.emit();
  }


}

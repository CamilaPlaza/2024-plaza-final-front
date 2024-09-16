import { Component, Output, EventEmitter, Input  } from '@angular/core';

@Component({
  selector: 'app-notice',
  templateUrl: './notice.component.html',
  styleUrl: './notice.component.css'
})
export class NoticeComponent {
  @Input() subtitle: string = ''; 
  @Output() onClose = new EventEmitter<void>();


  constructor() {}

  closeDialog() {
    this.onClose.emit();
  }


}

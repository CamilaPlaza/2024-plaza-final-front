import { Component, EventEmitter, Output, Input, OnInit } from '@angular/core';

@Component({
  selector: 'app-check-in-popup',
  templateUrl: './check-in-popup.component.html',
  styleUrls: ['./check-in-popup.component.css']
})
export class CheckInPopupComponent implements OnInit {
  @Input() userName: string = '';
  @Output() confirmed = new EventEmitter<string>();

  currentTime: string = new Date().toLocaleTimeString();
  observations: string = '';

  onConfirm() {
    this.confirmed.emit(this.observations);
  }

  ngOnInit() {
    this.updateCurrentTime();
  }

  updateCurrentTime() {
    const now = new Date();
    this.currentTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }


}

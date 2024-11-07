import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-info-points',
  templateUrl: './info-points.component.html',
  styleUrl: './info-points.component.css'
})
export class InfoPointsComponent {
  @Input() name: string = '';
  @Input() levelName: string = '';

}

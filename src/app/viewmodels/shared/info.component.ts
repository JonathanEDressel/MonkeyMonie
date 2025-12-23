import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-info-section',
  standalone: true,
  imports: [CommonModule],
  templateUrl: '../../views/shared/info.component.html',
  styleUrl: '../../styles/shared/info.component.scss'
})
export class InfoPanelComponent {

  @Input() title: string = '';
  @Input() subtitle: string = '';
  @Input() bodyMsg: string = '';

  showInfo: boolean = false;

  toggleInfo(): void {
    this.showInfo = !this.showInfo;
  }
}

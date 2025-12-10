import { Component, EventEmitter, Input, Output, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-modal',
  standalone: true,
  imports: [CommonModule],
  templateUrl: '../../views/shared/modal.component.html',
  styleUrls: ['../../styles/shared/modal.component.scss']
})

export class ModalPopup {
  @Input() title: string = "";
  @Input() message: string = "";
  @Input() content!: TemplateRef<any> | null;

  @Output() confirmButton = new EventEmitter<void>();
  @Output() cancelButton = new EventEmitter<void>();

  confirmAction() {
    this.confirmButton.emit();
  }

  cancelAction() {
    this.cancelButton.emit();
  }
}


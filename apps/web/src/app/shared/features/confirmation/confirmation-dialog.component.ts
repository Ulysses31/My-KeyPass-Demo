/**
 * Confirmation dialog component.
 *
 * Displays a reusable confirm/cancel dialog for destructive actions.
 */
import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Input, Output } from '@angular/core';

/**
 * Generic confirmation prompt shown before delete operations.
 */
@Component({
  selector: 'app-confirmation-dialog',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './confirmation-dialog.component.html'
})
/**
 * Generic confirmation prompt shown before delete operations.
 */
export class ConfirmationDialogComponent {
  @Input({ required: true }) isOpen: boolean = false;
  @Input() title: string | null = null;
  @Input() description: string | null = null;
  @Input() yesLabel: string = 'Yes';
  @Input() noLabel: string = 'No';
  @Input() isBusy: boolean = false;

  @Output() decision = new EventEmitter<boolean>();

  onNo(): void {
    this.decision.emit(false);
  }

  onYes(): void {
    this.decision.emit(true);
  }
}

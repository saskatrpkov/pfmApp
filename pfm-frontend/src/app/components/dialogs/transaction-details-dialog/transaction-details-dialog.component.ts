import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Transaction } from '../../../models/transaction';

@Component({
  selector: 'app-transaction-details-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './transaction-details-dialog.component.html',
  styleUrl: './transaction-details-dialog.component.scss'
})
export class TransactionDetailsDialogComponent {
  constructor(@Inject(MAT_DIALOG_DATA) public data: Transaction) {}
}

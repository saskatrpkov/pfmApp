import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { Transaction } from '../../../models/transaction';
import { Category } from '../../../models/category';

@Component({
  selector: 'app-transaction-details-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule],
  templateUrl: './transaction-details-dialog.component.html',
  styleUrl: './transaction-details-dialog.component.scss'
})
export class TransactionDetailsDialogComponent {
  transaction: Transaction;
  categories: Category[];

  constructor(@Inject(MAT_DIALOG_DATA) public data: { transaction: Transaction, categories: Category[] }) {
    this.transaction = data.transaction;
    this.categories = data.categories;
  }

  getCategoryLabel(catcode: string | number): string {
    const found = this.categories.find(c => c.code == catcode);
    return found?.name || 'Unknown';
  }
  
}

import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { ViewEncapsulation } from '@angular/core';
import {
  MAT_DIALOG_DATA,
  MatDialogRef,
  MatDialogActions,
  MatDialogContent
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatIcon } from '@angular/material/icon';

import { Split } from '../../../models/split';
import { Category } from '../../../models/category';
import { Transaction } from '../../../models/transaction';
import { CategoryService } from '../../../services/category.service';

@Component({
  selector: 'app-split-transaction-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatDialogContent,
    MatIcon,
    MatDialogActions
  ],
  templateUrl: './split-transaction-dialog.component.html',
  styleUrl: './split-transaction-dialog.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class SplitTransactionDialogComponent implements OnInit {
  splits: Split[] = [];
  allCategories: Category[] = [];
  parentCategories: Category[] = [];

  constructor(
    public dialogRef: MatDialogRef<SplitTransactionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public originalTransaction: Transaction,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe((categories) => {
      this.allCategories = categories;
      this.parentCategories = categories.filter((c) => c.parentCode === null);
    });

    this.addSplit();
    this.addSplit();
  }


  addSplit(): void {
    this.splits.push({
      id: Date.now() + Math.random(),
      category: null,
      amount: 0,
      filteredSubcategories: []
    });
  }

  removeSplit(split: Split): void {
    this.splits = this.splits.filter((s) => s.id !== split.id);
  }

  onCategoryChange(split: Split): void {
    if (!split.category) {
      split.filteredSubcategories = [];
      split.subcategory = undefined;
      return;
    }

    split.filteredSubcategories = this.allCategories
      .filter((cat) => cat.parentCode === split.category?.code)
      .map((cat) => cat.name);
      split.subcategory = undefined;
  }

  get totalSplitAmount(): number {
    const total = this.splits.reduce((sum, split) => {
      const value = typeof split.amount === 'string' ? parseFloat(split.amount) : split.amount;
      return sum + (value || 0);
    }, 0);
    return total;
  }


  isAmountValid(): boolean {
    const original = this.originalTransaction.amount;
    const total = this.totalSplitAmount;
    return original===total;
  }

  get amountDifference(): number {
    return this.originalTransaction.amount - this.totalSplitAmount;
  }
  get amountDifferenceAbs(): number {
    return Math.abs(this.amountDifference);
  }
  applySplits(): void {
    if (!this.isAmountValid()) {
      alert('Total amount of splits must match the original transaction.');
      return;
    }

    const splitsToSend = this.splits.map((split) => {
      let selectedName: string;

      if (split.subcategory) {
        selectedName = split.subcategory;
      } else if (split.category?.name) {

        selectedName = split.category.name;
      } else {
        return null; 
      }

      const selectedCode = this.allCategories.find((c) => c.name === selectedName)?.code;

      if (!selectedCode) return null;

      return {
        ['cat-code']: selectedCode,
        amount: split.amount
      };
    }).filter(Boolean); 

    this.dialogRef.close(splitsToSend);
  }




  cancel(): void {
    this.dialogRef.close();
  }

}

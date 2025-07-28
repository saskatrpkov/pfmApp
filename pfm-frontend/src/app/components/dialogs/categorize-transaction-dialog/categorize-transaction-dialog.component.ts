import { Component, Inject, OnInit, ViewEncapsulation } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/category';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-categorize-transaction-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './categorize-transaction-dialog.component.html',
  styleUrl: './categorize-transaction-dialog.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class CategorizeTransactionDialogComponent implements OnInit {
  allCategories: Category[] = [];
  parentCategories: Category[] = [];
  subcategories: Category[] = [];

  selectedCategory: Category | null = null;
  selectedSubcategory: Category | null = null;

  constructor(
    private dialogRef: MatDialogRef<CategorizeTransactionDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
  this.categoryService.getCategories().subscribe((categories) => {
    this.allCategories = categories;
    this.parentCategories = categories.filter(c => c.parentCode === null);

    const selectedCatCode = this.data.transaction.category;

    const selected = this.allCategories.find(c => c.code === selectedCatCode);
    if (!selected) {
      this.selectedCategory = null;
      this.selectedSubcategory = null;
      return;
    }

    if (selected.parentCode === null) {
      // Glavna kategorija
      this.selectedCategory = selected;
      this.selectedSubcategory = null;
    } else {
      // Podkategorija
      this.selectedSubcategory = selected;
      this.selectedCategory = this.allCategories.find(c => c.code === selected.parentCode) || null;
    }

    this.onCategoryChange();
  });
}


  onCategoryChange(): void {
    if (this.selectedCategory) {
      this.subcategories = this.allCategories.filter(
        c => c.parentCode === this.selectedCategory!.code
      );

      // Resetuj ako prethodno selektovana podkategorija više ne postoji
      if (!this.subcategories.find(sc => sc.code === this.selectedSubcategory?.code)) {
        this.selectedSubcategory = null;
      }
    } else {
      this.subcategories = [];
      this.selectedSubcategory = null;
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onApply(): void {
    let catcode = '';

    if (this.selectedSubcategory) {
      catcode = this.selectedSubcategory.code;
    } else if (this.selectedCategory) {
      catcode = this.selectedCategory.code;
    }

    console.log('Finalni catcode:', catcode);
    this.dialogRef.close({ catcode });
  }
}

import { CommonModule } from '@angular/common';
import { Component, Inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CategoryService } from '../../../services/category.service';
import { Category } from '../../../models/category';
import { ViewEncapsulation } from '@angular/core';
@Component({
  selector: 'app-categorize-multiple-transactions-dialog',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatDialogModule
  ],
  templateUrl: './categorize-multiple-transactions-dialog.component.html',
  styleUrl: './categorize-multiple-transactions-dialog.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class CategorizeMultipleTransactionsDialogComponent implements OnInit {
  allCategories: Category[] = [];
  parentCategories: Category[] = [];
  subcategories: Category[] = [];

  selectedCategory: Category | null = null;
  selectedSubcategory: Category | null = null;

  constructor(
    private dialogRef: MatDialogRef<CategorizeMultipleTransactionsDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { selectedCount: number },
    private categoryService: CategoryService
  ) {}

  ngOnInit(): void {
    this.categoryService.getCategories().subscribe((categories) => {
      this.allCategories = categories;
      this.parentCategories = categories.filter(c => c.parentCode === null);
    });
  }

  onCategoryChange(): void {
    if (this.selectedCategory) {
      this.subcategories = this.allCategories.filter(
        (cat) => cat.parentCode === this.selectedCategory!.code
      );
      if (!this.subcategories.find(s => s.code === this.selectedSubcategory?.code)) {
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


import { Component, OnInit, ElementRef, HostListener, viewChild, ViewChild } from '@angular/core';
import { Transaction } from '../../../models/transaction';
import { TransactionService } from '../../../services/transaction.service';
import { Category } from '../../../models/category';
import { CategoryService } from '../../../services/category.service';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDialog } from '@angular/material/dialog';
import { forkJoin } from 'rxjs';
import { trigger, transition, style, animate } from '@angular/animations';
import { KindFilterComponent } from '../../filters/kind-filter/kind-filter.component';
import { DateFilterComponent } from '../../filters/date-filter/date-filter.component';
import { ChartsOverviewComponent } from '../../graphs/charts-overview/charts-overview.component';
import { CategorizeTransactionDialogComponent } from '../../dialogs/categorize-transaction-dialog/categorize-transaction-dialog.component';
import { CategorizeMultipleTransactionsDialogComponent } from '../../dialogs/categorize-multiple-transactions-dialog/categorize-multiple-transactions-dialog.component';
import { SplitTransactionDialogComponent } from '../../dialogs/split-transaction-dialog/split-transaction-dialog.component';
import { MatIcon } from '@angular/material/icon';
import { MatCheckbox } from '@angular/material/checkbox';
import { CommonModule } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { FormsModule } from '@angular/forms';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { ViewEncapsulation } from '@angular/core';
import { TransactionDetailsDialogComponent } from '../../dialogs/transaction-details-dialog/transaction-details-dialog.component';
@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [
    KindFilterComponent,
    DateFilterComponent,
    ChartsOverviewComponent,
    MatIcon,
    MatCheckbox,
    CommonModule,
    MatTableModule,
    FormsModule,
    MatSlideToggleModule,
    MatSidenavModule,
    MatButtonModule
  ],
  templateUrl: './transaction-list.component.html',
  styleUrl: './transaction-list.component.scss',
  encapsulation: ViewEncapsulation.None,
  animations: [
    trigger('fadeSlide', [
      transition(':enter', [
        style({ opacity: 0, transform: 'translateY(-10px)' }),
        animate('300ms ease-out', style({ opacity: 1, transform: 'translateY(0)' }))
      ]),
      transition(':leave', [
        animate('200ms ease-in', style({ opacity: 0, transform: 'translateY(-10px)' }))
      ])
    ])
  ]

})
export class TransactionListComponent implements OnInit {
  @ViewChild('filterDrawer') filterDrawer!: MatDrawer;
  @ViewChild(ChartsOverviewComponent) chartsOverview!: ChartsOverviewComponent;

  transactions: Transaction[] = [];
  filteredTransactions: Transaction[] = [];
  transactionsCategories: Category[] = [];

  totalItemCount = 0;
  kinds: string[] = [];
  selectedKind: string = 'All';
  fromDate: Date | null = null;
  toDate: Date | null = null;

  pendingKind: string = 'All';
  pendingFromDate: Date | null = null;
  pendingToDate: Date | null = null;


  isMultiSelectMode = false;
  expandedTransactionId: string | null = null;
  showChartView: boolean = false;
  drawerOpened = false;

  currentPage = 1;
  transactionsPerPage = 10;

  searchText: string = '';
  isSearchMode: boolean = false;
  refreshTrigger: number = 0;
  cards = [
    {
      id: 1,
      name: 'Trpkov Aleksandra',
      number: '4642 3489 9867 7632',
      valid: '11/15',
      expiry: '03/27',
      bgImage: 'https://i.imgur.com/kGkSg1v.png',
      logo: 'https://i.imgur.com/bbPHJVe.png'
    },
    {
      id: 2,
      name: 'Trpkov Aleksandra',
      number: '4642 3489 9867 7632',
      valid: '11/15',
      expiry: '03/27',
      bgImage: 'https://i.imgur.com/Zi6v09P.png',
      logo: 'https://i.imgur.com/bbPHJVe.png'
    }
  ];

  constructor(
    private transactionService: TransactionService,
    private categoryService: CategoryService,
    private dialog: MatDialog,
    private elementRef: ElementRef
  ) {}

  ngOnInit(): void {

    this.kinds = [
      'dep', 'wdw', 'pmt', 'fee', 'inc',
      'rev', 'adj', 'lnd', 'lnr',
      'fcx', 'aop', 'acl', 'spl', 'sal'
    ];

    
    this.categoryService.getCategories().subscribe((categories) => {
      this.transactionsCategories = categories;
      this.fetchTransactions();
    });

  }

  fetchTransactions(): void {
    const kinds = this.selectedKind !== 'All' ? [this.selectedKind] : [];
    const startDateStr = this.fromDate?.toISOString().split('T')[0];
    const endDateStr = this.toDate?.toISOString().split('T')[0];
    this.transactionService.getTransactions({
    pageNumber: this.currentPage,
    pageSize: this.transactionsPerPage,
    kinds,
    startDate: startDateStr,
    endDate: endDateStr
    }).subscribe((res) => {
      this.transactions = res.items; 
      this.totalItemCount = res.totalCount;

      if (!this.isSearchMode) {
        this.filteredTransactions = []; 
      }
   });
  }

  refreshTransactions(): void {
    this.fetchTransactions();
  }

  // -------------------------
  // FILTERI
  // -------------------------

    onSearchChange(): void {
    const text = this.searchText.toLowerCase().trim();
    this.isSearchMode = !!text;

    if (this.isSearchMode) {
        this.filteredTransactions = this.transactions.filter(t =>
          t['beneficiaryName'].toLowerCase().includes(text)
        );
        this.totalItemCount = this.filteredTransactions.length;
        this.currentPage = 1;
      } else {
        this.fetchTransactions(); 
      }
    }


  onDateRangeSelected(range: { from: Date | null; to: Date | null }): void {
    this.currentPage = 1;
    this.pendingFromDate = range.from;
    this.pendingToDate = range.to;
  }

  toggleKindFilter(): void {
    this.drawerOpened = true;
    this.filterDrawer.toggle();
  }

  closeDrawer():void {
    this.drawerOpened = false;
    this.filterDrawer.close();
  }

  applyFilters(): void {
    this.selectedKind = this.pendingKind;
    this.fromDate = this.pendingFromDate;
    this.toDate = this.pendingToDate;
    this.currentPage = 1;
    this.fetchTransactions();
  }

  onApplyAndClose():void{
    this.applyFilters(); 
    this.closeDrawer();  
  }

  onClearAndClose():void{
    this.clearFilters();
    this.closeDrawer(); 
  }

  clearFilters(): void {
    this.selectedKind = 'All';
    this.pendingKind = 'All';
    this.fromDate = null;
    this.toDate = null;
    this.pendingFromDate = null;
    this.pendingToDate = null;
    this.fetchTransactions();
  } 
  // -------------------------
  // DIALOGI
  // -------------------------

  //KATEGORIZACIJA
  openCategorizeDialog(transaction: Transaction): void {
    const dialogRef = this.dialog.open(CategorizeTransactionDialogComponent, {
      width: '90vw',
      maxWidth: '400px',
      data: { transaction }
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        const catcode = result.catcode;
        transaction.category = catcode;
        transaction.subcategory = catcode;
        this.transactionService.updateTransactionCategory(transaction.id, { catcode }).subscribe();
        if (this.chartsOverview) {
          this.refreshTrigger++;
        }
      }
    });
  }

  //MULTI KATEGORIZACIJA
  openMultiCategorizationDialog(): void {
    const source = this.isSearchMode ? this.filteredTransactions : this.transactions;
    const selectedTransactions = source.filter(t => t.selected);
    const dialogRef = this.dialog.open(CategorizeMultipleTransactionsDialogComponent, {
      width: '90vw',
      maxWidth: '400px',
      data: {
        selectedCount: selectedTransactions.length,
        transactions: selectedTransactions
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const catcode = result.catcode;
        const updateRequests = selectedTransactions.map(t =>
           this.transactionService.updateTransactionCategory(t.id, { catcode })
        );

        forkJoin(updateRequests).subscribe(() => {
          selectedTransactions.forEach(t => {
            const category = this.transactionsCategories.find(c => c.code === catcode);
            if (category?.parentCode) {
              t.category = category.parentCode;
              t.subcategory = category.code;
            } else {
              t.category = catcode;
              t.subcategory = '';
            }
            t.selected = false;
          });

          this.isMultiSelectMode = false;
          if (this.chartsOverview) {
            this.refreshTrigger++;
          }
        });
      }
    });
  }
  //SPLIT DIALOG
  openSplitDialog(transaction: Transaction): void {
    const dialogRef = this.dialog.open(SplitTransactionDialogComponent, {
      width: '90vw',
      maxWidth: '500px',
      data: transaction
    });

    dialogRef.afterClosed().subscribe((result) => {
      if (result?.length) {
        this.transactionService.splitTransactionApiStyle(transaction.id, result).subscribe(() => {
          this.onSplitCompleted(transaction.id); 
        });
      }
    });
  }


  // -------------------------
  // MULTI SELECT
  // -------------------------
  toggleMultiSelect(): void {
    this.isMultiSelectMode = true;
    const source = this.isSearchMode ? this.filteredTransactions : this.transactions;
    source.forEach(t => t.selected = false);
  }

  cancelMultiSelect(): void {
    this.isMultiSelectMode = false;
    const source = this.isSearchMode ? this.filteredTransactions : this.transactions;
    source.forEach(t => t.selected = false);
  }

  hasSelectedTransactions(): boolean {
    const source = this.isSearchMode ? this.filteredTransactions : this.transactions;
    return source.some(t => t.selected);
  }

  // -------------------------
  // SPLIT / ACCORDION
  // -------------------------
  toggleAccordion(id: string): void {
    this.expandedTransactionId = this.expandedTransactionId === id ? null : id;
  }

  getSplitLabel(catcode: string): { labelType: 'Category' | 'Subcategory', label: string } {
    const category = this.transactionsCategories.find(c => c.code === catcode);
    if (!category) return { labelType: 'Category', label: catcode };

    return category.parentCode
      ? { labelType: 'Subcategory', label: category.name }
      : { labelType: 'Category', label: category.name };
  }

  // -------------------------
  // REFRESH
  // -------------------------
  onSplitCompleted(transactionId: string): void {
      setTimeout(() => {
        this.refreshTransactions();
        this.expandedTransactionId = transactionId; 
        if (this.chartsOverview) {
          this.refreshTrigger++;
        }

        setTimeout(() => {
          const element = this.elementRef.nativeElement.querySelector(`[data-transaction-id="${transactionId}"]`);
          if (element) {
            element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          }
        }, 100);
      }, 300);
    }
  
    getMainCategoryLabel(catcode: string): string {
     const category = this.transactionsCategories.find(c => c.code === catcode);
     if (!category) return catcode;
     if (!category.parentCode) return category.name;
     const parent = this.transactionsCategories.find(c => c.code === category.parentCode);
     return parent?.name ?? catcode;
   }
   openTransactionDetailsDialog(transaction: Transaction) {
    if (window.innerWidth > 768) return; 

    this.dialog.open(TransactionDetailsDialogComponent, {
      data: {
        transaction,
        categories: this.transactionsCategories 
      },
      panelClass: 'dialog-container'
    });
  }

  // -------------------------
  // PAGINACIJA
  // -------------------------
  get paginatedTransactions(): Transaction[] {
    const start = (this.currentPage - 1) * this.transactionsPerPage;
    if (this.isSearchMode) {
      return this.filteredTransactions.slice(start, start + this.transactionsPerPage);
    }
    return this.transactions; 
  }


  get totalPages(): number {
    const count = this.isSearchMode ? this.filteredTransactions.length : this.totalItemCount;
    return Math.ceil(count / this.transactionsPerPage);
  }


  changePage(page: number): void {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;

      if (!this.isSearchMode) {
        this.fetchTransactions(); 
      }
    }
  }


  get visiblePageNumbers(): (number | '...')[] {
    const total = this.totalPages;
    const current = this.currentPage;
    const delta = 1;
    const range: (number | '...')[] = [];
    const left = Math.max(2, current - delta);
    const right = Math.min(total - 1, current + delta);

    range.push(1);
    if (left > 2) range.push('...');

    for (let i = left; i <= right; i++) range.push(i);
    if (right < total - 1) range.push('...');
    if (total > 1) range.push(total);

    return range;
  }


  // -------------------------
  // KOLONE
  // -------------------------
  get displayedColumns(): string[] {
    return this.isMultiSelectMode
      ? ['select', 'beneficiaryName', 'kind', 'direction', 'date', 'amount', 'category', 'split']
      : ['beneficiaryName', 'kind', 'direction', 'date', 'amount', 'category', 'split'];
  }
}

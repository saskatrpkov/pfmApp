import { Component, EventEmitter, Input, Output, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';

@Component({
  selector: 'app-kind-filter',
  standalone: true,
  imports: [CommonModule, FormsModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './kind-filter.component.html',
  styleUrl: './kind-filter.component.scss',
  encapsulation: ViewEncapsulation.None
})
export class KindFilterComponent {
  @Input() kinds: string[] = []; 
  @Input() selectedKind: string = 'All'; 
  @Output() selectedKindChange = new EventEmitter<string>();

  kindLabels: { [key: string]: string } = {
    All: 'All',
    dep: 'Deposit',
    wdw: 'Withdrawal',
    pmt: 'Payment',
    fee: 'Fee',
    inc: 'Interest Credit',
    rev: 'Reversal',
    adj: 'Adjustment',
    lnd: 'Loan Disbursement',
    lnr: 'Loan Repayment',
    fcx: 'FX Exchange',
    aop: 'Account Opening',
    acl: 'Account Closing',
    spl: 'Split Payment',
    sal: 'Salary',
  };

  getLabel(kind: string): string {
    return this.kindLabels[kind] || kind;
  }

  onSelectionChange(kind: string): void {
    this.selectedKind = kind;
    this.selectedKindChange.emit(kind);
  }
}

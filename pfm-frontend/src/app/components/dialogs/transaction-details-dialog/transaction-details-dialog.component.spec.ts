import { ComponentFixture, TestBed } from '@angular/core/testing';

import { TransactionDetailsDialogComponent } from './transaction-details-dialog.component';

describe('TransactionDetailsDialogComponent', () => {
  let component: TransactionDetailsDialogComponent;
  let fixture: ComponentFixture<TransactionDetailsDialogComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TransactionDetailsDialogComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(TransactionDetailsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

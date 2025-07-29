import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Transaction } from '../models/transaction';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {
  private baseUrl = 'https://localhost:7138';
 

  constructor(private http:HttpClient) { }

    getTransactions(params?: {
      pageNumber?: number;
      pageSize?: number;
      kinds?: string[];
      startDate?: string;
      endDate?: string;
      }): Observable<{ items: Transaction[]; totalCount: number }> {
      const queryParams: any = {
        'page-number': params?.pageNumber ?? 1,
        'page-size': params?.pageSize ?? 10,
      };

    if (params?.kinds?.length) queryParams['transaction-kind'] = params.kinds;
    if (params?.startDate) queryParams['start-date'] = params.startDate;
    if (params?.endDate) queryParams['end-date'] = params.endDate;
    
    return this.http.get<any>(`${this.baseUrl}/transactions`, { params: queryParams }).pipe(
      map((data) => ({
        items: data.items.map((item: any) => ({
          id: item.id,
          beneficiaryName: item['beneficiary-name'],
          date: new Date(item.date).toISOString(),
          direction: item.direction,
          amount: typeof item.amount === 'string'
            ? parseFloat(item.amount.replace(/,/g, ''))
            : item.amount,
          currency: item.currency,
          kind: item.kind,
          isSplit: Array.isArray(item.splits) && item.splits.length > 0, // ✅ ovde je ključ
          //isSplit: item.isSplit ?? false,
          splits: item.splits ?? [],
          category: item['cat-code'] ?? '',
          subcategory: item['cat-code'] ?? '',
          selected: false
        })),
        totalCount: data['total-count']
      }))
    );
  }


  updateTransactionCategory(id: string, update: { catcode: string }): Observable<any> {
    return this.http.post(`${this.baseUrl}/transactions/${id}/categorize`, {
      'cat-code': update.catcode
    });
  }

  splitTransactionApiStyle(transactionId: string, splits: { catcode: string; amount: number }[]): Observable<any> {
    return this.http.post(`${this.baseUrl}/transactions/${transactionId}/split`, splits);
  }
    

}

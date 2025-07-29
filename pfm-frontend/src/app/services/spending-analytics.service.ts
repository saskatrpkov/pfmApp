import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

export interface SpendingAnalyticsGroup {
  catcode: string | null;
  amount: number;
  count: number;
}

export interface SpendingAnalyticsRequest {
  catcode?: string;
  startDate?: string;
  endDate?: string;
  direction?: 'c' | 'd';
}

@Injectable({
  providedIn: 'root'
})
export class SpendingAnalyticsService {
  private baseUrl = 'https://localhost:7138';

  constructor(private http: HttpClient) {}

  getAnalytics(params?: SpendingAnalyticsRequest): Observable<SpendingAnalyticsGroup[]> {
    const queryParams: any = {};

    if (params?.catcode) queryParams['catcode'] = params.catcode;
    if (params?.startDate) queryParams['start-date'] = params.startDate;
    if (params?.endDate) queryParams['end-date'] = params.endDate;
    if (params?.direction) queryParams['direction'] = params.direction;

    return this.http.get<any>(`${this.baseUrl}/spending-analytics`, { params: queryParams }).pipe(
  map((data) =>
    (data.groups || [])
      .filter((item: any) => item['cat-code'] !== null && item['cat-code'] !== undefined) // ⬅️ prvo filtriraj
      .map((item: any) => ({
        catcode: item['cat-code'],
        amount: typeof item.amount === 'string'
          ? parseFloat(item.amount.replace(/,/g, ''))
          : item.amount,
        count: item.count
      }))
  )
);

  }
}

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Category } from '../models/category';

@Injectable({
  providedIn: 'root'
})
export class CategoryService {
  constructor(private http: HttpClient) {}

  getCategories(): Observable<Category[]> {
  return this.http.get<{ items: any[] }>('https://localhost:7138/categories').pipe(
    map((data) =>
      data.items.map((cat) => ({
        code: cat.code,
        name: cat.name,
        parentCode: cat['parent-code'] || null
      }))
    )
  );}

  
}

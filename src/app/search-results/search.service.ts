import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { shareReplay, catchError } from 'rxjs/operators';

export interface Phone {
  id?: string;
  slug?: string;
  name: string;
  carrier?: string;
  screenSize?: string;
  brand?: string;
  category?: string;
  images?: string[];
  dealPrice?: number;
  mrp?: number;
  price?: number;
}

@Injectable({ providedIn: 'root' })
export class SearchService {
  private http = inject(HttpClient);

  // cache the phones list
  phones$ = this.http
    .get<Phone[]>('http://localhost:3000/api/phones')
    .pipe(catchError(() => this.http.get<Phone[]>('/assets/phones/phones.json')),
      shareReplay({ bufferSize: 1, refCount: false })
    );

  constructor() {}
}

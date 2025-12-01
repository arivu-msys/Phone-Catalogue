import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

const STORAGE_KEY = 'username';

@Injectable({ providedIn: 'root' })
export class UserService {
  private _userName$ = new BehaviorSubject<string | null>(null);
  public readonly userName$ = this._userName$.asObservable();

  constructor() {
    // load from localStorage if available
    try {
      const v = localStorage.getItem(STORAGE_KEY);
      if (v) this._userName$.next(v);
    } catch (e) {
      // ignore
    }
  }

  setUserName(name: string | null) {
    try {
      if (name) {
        localStorage.setItem(STORAGE_KEY, name);
        this._userName$.next(name);
      } else {
        localStorage.removeItem(STORAGE_KEY);
        this._userName$.next(null);
      }
    } catch (e) {
      console.warn('Failed to persist username', e);
      this._userName$.next(name);
    }
  }

  getUserName(): string | null {
    return this._userName$.getValue();
  }
}

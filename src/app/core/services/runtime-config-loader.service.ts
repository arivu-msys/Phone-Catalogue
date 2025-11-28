import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class RuntimeConfigLoaderService {

  private config: any = null;

  constructor() {
    // Always load from window — main.ts already populated it BEFORE bootstrap
    this.config = (window as any).__RUNTIME_CONFIG__ || {};
  }

  get(key: string): any {
    return this.config[key];
  }
}

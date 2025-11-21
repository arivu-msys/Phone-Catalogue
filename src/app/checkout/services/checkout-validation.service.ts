import { Injectable } from '@angular/core';
import { FormGroup } from '@angular/forms';

@Injectable({
  providedIn: 'root',
})
export class CheckoutValidationService {
  private forms: FormGroup[] = [];

  registerForm(form: FormGroup): void {
    if (!this.forms.includes(form)) {
      this.forms.push(form);
    }
  }

  validateAll(): boolean {
    let allValid = true;
    this.forms.forEach((f) => {
      f.markAllAsTouched();
      if (!f.valid) allValid = false;
    });
    return allValid;
  }
}

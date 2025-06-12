import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../_services/auth_service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  submitted = false;
  showPwd = false;
  showConfirm = false;
  errorMsg = '';

  constructor(private fb: FormBuilder, private auth: AuthService) {
    this.registerForm = this.fb.group(
      {
        name: ['', Validators.required],
        email: ['', [Validators.required, Validators.email]],
        password: ['', [Validators.required, Validators.minLength(6)]],
        confirm: ['', Validators.required],
      },
      { validator: this.matchPasswords }
    );
  }

  // raccourci pour le template
  get f() {
    return this.registerForm.controls;
  }

  /** Vérifie que password == confirm */
  matchPasswords(group: FormGroup) {
    return group.get('password')!.value === group.get('confirm')!.value
      ? null
      : { notMatching: true };
  }

  togglePwd()     { this.showPwd = !this.showPwd; }
  toggleConfirm() { this.showConfirm = !this.showConfirm; }

  onSubmit(): void {
    this.submitted = true;
    this.errorMsg  = '';
    if (this.registerForm.invalid) return;

    this.loading = true;
    const { name, email, password } = this.registerForm.value;

    this.auth.signup({ name, email, password }).subscribe({
      next: () => (this.loading = false),
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.error ?? 'Erreur inattendue';
      },
    });
  }
}

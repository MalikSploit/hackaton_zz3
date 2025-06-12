import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../_services/auth_service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
})
export class LoginComponent {
  loginForm: FormGroup;
  loading = false;
  submitted = false;
  showPwd = false;
  errorMsg = '';

  constructor(private fb: FormBuilder, private auth: AuthService) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  get f() {
    return this.loginForm.controls;
  }

  togglePwd() { this.showPwd = !this.showPwd; }

  onSubmit(): void {
    this.submitted = true;
    this.errorMsg  = '';
    if (this.loginForm.invalid) return;

    this.loading = true;
    const { email, password } = this.loginForm.value;

    this.auth.login({ email, password }).subscribe({
      next: () => (this.loading = false),
      error: (err) => {
        this.loading = false;
        this.errorMsg = err.error?.error ?? 'Identifiants invalides';
      },
    });
  }
}

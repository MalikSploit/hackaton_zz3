import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
})
export class RegisterComponent {
  registerForm: FormGroup;
  loading = false;
  submitted = false;
  showPwd = false;        // champ “password”
  showConfirm = false;    // champ “confirm”

  togglePwd(): void {
    this.showPwd = !this.showPwd;
  }

  toggleConfirm(): void {
    this.showConfirm = !this.showConfirm;
  }

  constructor(private fb: FormBuilder) {
    this.registerForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirm: ['', Validators.required]
    }, { validator: this.matchPasswords });
  }

  get f() { return this.registerForm.controls; }

  matchPasswords(group: FormGroup) {
    const p = group.get('password')!.value;
    const c = group.get('confirm')!.value;
    return p === c ? null : { notMatching: true };
  }

  onSubmit(): void {
    this.submitted = true;
    if (this.registerForm.invalid) return;
    this.loading = true;
    // TODO: appeler le service d’enregistrement
  }
}

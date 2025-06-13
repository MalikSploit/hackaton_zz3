import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { AuthService, User } from '../_services/auth_service';
import { finalize } from 'rxjs';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
})
export class ProfileComponent implements OnInit {
  user: User | null = null;
  busy = false;
  error: string | null = null;
  success: string | null = null;

  form = this.fb.group({
    current: ['', Validators.required],
    next:    ['', [Validators.required, Validators.minLength(6)]],
    confirm: ['', Validators.required],
  }, { validators: this.matchPasswords });

  constructor(private auth: AuthService, private fb: FormBuilder) {}

  ngOnInit() {
    this.auth.me().subscribe(u => this.user = u);
  }

  matchPasswords(group: any) {
    return group.get('next')!.value === group.get('confirm')!.value
      ? null
      : { mismatch: true };
  }

  submit() {
    if (this.form.invalid) return;
    this.busy = true;
    this.error = this.success = null;
    const { current, next } = this.form.value;
    this.auth.changePassword({ current, next })
      .pipe(finalize(() => this.busy = false))
      .subscribe({
        next: () => {
          this.success = 'Mot de passe mis à jour avec succès.';
          this.form.reset();
        },
        error: (e) => this.error = e.message || 'Erreur inconnue',
      });
  }
}

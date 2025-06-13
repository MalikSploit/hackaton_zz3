import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, finalize, tap } from 'rxjs';

interface MeResponse {
  ok: boolean;
  user?: { id: number; full_name: string; email: string; created_at: string };
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _isLogged$ = new BehaviorSubject<boolean>(false);
  readonly isLogged$ = this._isLogged$.asObservable();

  constructor(private http: HttpClient) {
    this.http.get<MeResponse>('/api/me')
      .subscribe({
        next: res => this._isLogged$.next(res.ok),
        error: () => this._isLogged$.next(false),
      });
  }

  isLogged(): boolean {
    return this._isLogged$.value;
  }

  login(email: string, password: string) {
    return this.http.post<MeResponse>('/api/login', { email, password }).pipe(
      tap(res => this._isLogged$.next(res.ok))
    );
  }

  logout() {
    return this.http.post<{ ok: boolean }>('/api/logout', {}).pipe(
      finalize(() => this._isLogged$.next(false))
    );
  }
}

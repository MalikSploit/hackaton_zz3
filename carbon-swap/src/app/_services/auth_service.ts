import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  catchError,
  map,
  Observable,
  of,
  tap,
} from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../environments/environment';

export interface User {
  id: number;
  full_name: string;
  email: string;
  created_at: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = `${environment.apiUrl}/auth`;
  private _user$ = new BehaviorSubject<User | null>(null);
  public  user$  = this._user$.asObservable();

  constructor(private http: HttpClient, private router: Router) {
    this.loadSession();
  }

  private loadSession() {
    this.http
      .get<{ ok: true; user: User }>(`${this.api}/me`, { withCredentials: true })
      .pipe(
        map(res => res.user),
        catchError(() => of(null))
      )
      .subscribe(user => this._user$.next(user));
  }

  isLogged(): boolean {
    return this._user$.value !== null;
  }

  signup(body: { name: string; email: string; password: string }): Observable<User> {
    return this.http
      .post<{ ok: true; user: User }>(`${this.api}/signup`, body, { withCredentials: true })
      .pipe(
        map(res => res.user),
        tap(user => {
          this._user$.next(user);
          this.router.navigate(['/wallet']);
        })
      );
  }

  login(body: { email: string; password: string }): Observable<User> {
    return this.http
      .post<{ ok: true; user: User }>(`${this.api}/login`, body, { withCredentials: true })
      .pipe(
        map(res => res.user),
        tap(user => {
          this._user$.next(user);
          this.router.navigate(['/wallet']);
        })
      );
  }

  logout(): void {
    this.http
      .post<{ ok: true }>(`${this.api}/logout`, {}, { withCredentials: true })
      .subscribe(() => {
        this._user$.next(null);
        this.router.navigate(['/login']);
      });
  }

  me(): Observable<User | null> {
    return this.http
      .get<{ ok: true; user: User }>(`${this.api}/me`, { withCredentials: true })
      .pipe(
        map(res => res.user),
        tap(user => this._user$.next(user)),
        catchError(() => {
          this._user$.next(null);
          return of(null);
        })
      );
  }
}

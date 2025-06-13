import { inject } from '@angular/core';
import {
  CanActivateFn,
  CanMatchFn,
  ActivatedRouteSnapshot,
  RouterStateSnapshot,
  Route,
  UrlSegment,
  Router,
} from '@angular/router';
import { AuthService } from '../app/_services/auth_service';

function checkAuth(): boolean | ReturnType<Router['parseUrl']> {
  const auth   = inject(AuthService);
  const router = inject(Router);
  return auth.isLogged()
    ? true
    : router.parseUrl('/login');
}

export const authActivateGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => checkAuth();

export const authMatchGuard: CanMatchFn = (
  route: Route,
  segments: UrlSegment[]
) => checkAuth();

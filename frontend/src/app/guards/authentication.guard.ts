import { Injectable, inject } from '@angular/core';
import { CanActivate, Router, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Authentication, AuthenticationState } from '../services/authentication';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationGuard implements CanActivate {
  private auth = inject(Authentication);
  private router = inject(Router);

  canActivate(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): boolean {
    if (!this.auth.isAuthenticated()) {
      this.router.navigate(['']);
      return false;
    }

    const allowedRoles = route.data['allowedRoles'] as AuthenticationState[] | undefined;

    if (allowedRoles && allowedRoles.length > 0) {
      const hasRole = allowedRoles.some(role => role === this.auth.authenticatedState);
      if (!hasRole) {
        this.router.navigate(['/events']);
        return false;
      }
    }

    return true;
  }
}

import { Injectable } from '@angular/core';

export enum AuthenticationState {
  Admin = 'admin',
  User = 'user',
  Organizer = 'organizer',
  None = 'none',
}

const AUTH_STORAGE_KEY = 'authentication-state';

@Injectable({
  providedIn: 'root',
})
export class Authentication {

  authenticatedState: AuthenticationState = AuthenticationState.None;

  constructor() {
    this.authenticatedState = this.readAuthenticationState();
  }

  setAuthenticationState(state: AuthenticationState | string) {
    this.authenticatedState = this.normalizeAuthenticationState(state);
    this.persistAuthenticationState();
  }

  isAuthenticated(): boolean {
    return this.authenticatedState !== AuthenticationState.None;
  }

  clearAuthenticationState() {
    this.authenticatedState = AuthenticationState.None;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    }
  }

  private normalizeAuthenticationState(state: AuthenticationState | string): AuthenticationState {
    const normalizedState = typeof state === 'string' ? state.trim().toLowerCase() : state;

    switch (normalizedState) {
      case 'admin':
        return AuthenticationState.Admin;
      case 'organizer':
        return AuthenticationState.Organizer;
      case 'student':
      case 'user':
        return AuthenticationState.User;
      default:
        return AuthenticationState.None;
    }
  }

  private readAuthenticationState(): AuthenticationState {
    if (typeof localStorage === 'undefined') {
      return AuthenticationState.None;
    }

    const storedState = localStorage.getItem(AUTH_STORAGE_KEY);

    if (!storedState) {
      return AuthenticationState.None;
    }

    return this.normalizeAuthenticationState(storedState);
  }

  private persistAuthenticationState() {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(AUTH_STORAGE_KEY, this.authenticatedState);
  }
}


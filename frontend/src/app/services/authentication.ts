import { Injectable } from '@angular/core';

export enum AuthenticationState {
  Admin = 'admin',
  User = 'user',
  Organizer = 'organizer',
  None = 'none',
}

const AUTH_STORAGE_KEY = 'authentication-state';
const AUTH_USER_ID_KEY = 'authentication-user-id';

@Injectable({
  providedIn: 'root',
})
export class Authentication {

  authenticatedState: AuthenticationState = AuthenticationState.None;
  userId = 0;

  constructor() {
    this.authenticatedState = this.readAuthenticationState();
    this.userId = this.readUserId();
  }

  setAuthenticationState(state: AuthenticationState | string) {
    this.authenticatedState = this.normalizeAuthenticationState(state);
    this.persistAuthenticationState();
  }

  setUserId(id: number) {
    this.userId = id;
    this.persistUserId();
  }

  isAuthenticated(): boolean {
    return this.authenticatedState !== AuthenticationState.None;
  }

  clearAuthenticationState() {
    this.authenticatedState = AuthenticationState.None;
    this.userId = 0;
    if (typeof localStorage !== 'undefined') {
      localStorage.removeItem(AUTH_STORAGE_KEY);
      localStorage.removeItem(AUTH_USER_ID_KEY);
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

  private readUserId(): number {
    if (typeof localStorage === 'undefined') {
      return 0;
    }

    const storedId = localStorage.getItem(AUTH_USER_ID_KEY);
    return storedId ? Number(storedId) || 0 : 0;
  }

  private persistAuthenticationState() {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(AUTH_STORAGE_KEY, this.authenticatedState);
  }

  private persistUserId() {
    if (typeof localStorage === 'undefined') {
      return;
    }

    localStorage.setItem(AUTH_USER_ID_KEY, String(this.userId));
  }
}


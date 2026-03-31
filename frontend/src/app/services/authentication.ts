import { Injectable } from '@angular/core';

export enum AuthenticationState {
  Admin = 'admin',
  User = 'user',
  Organizer = 'organizer',
  None = 'none',
}

@Injectable({
  providedIn: 'root',
})
export class Authentication {

  authenticatedState: AuthenticationState = AuthenticationState.None;

  constructor() {}

  setAuthenticationState(state: AuthenticationState) {
    this.authenticatedState = state;
  }

  isAuthenticated(): boolean {
    return this.authenticatedState !== AuthenticationState.None;
  }
}


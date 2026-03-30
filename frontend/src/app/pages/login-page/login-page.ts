import { Component } from '@angular/core';
import { LoginLogo } from '../../components/login/login-logo/login-logo';

@Component({
  selector: 'app-login-page',
  imports: [LoginLogo],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {

  isRegistering: boolean = false;

  toggleRegister() {
    this.isRegistering = true;
  }

  onLogin() {

  }
}

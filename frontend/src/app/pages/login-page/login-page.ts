import { Component, inject } from '@angular/core';
import { LoginLogo } from '../../components/login/login-logo/login-logo';
import { Router } from '@angular/router';
@Component({
  selector: 'app-login-page',
  imports: [LoginLogo],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {

  router = inject(Router);

  isRegistering: boolean = false;

  toggleRegister() {
    this.isRegistering = true;
  }

  onLogin() {
    // TODO autenticacion
    this.router.navigate(['/user']);
  }

  onCancel() {
    this.isRegistering = false;
  }
}

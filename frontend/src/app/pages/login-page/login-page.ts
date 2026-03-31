import { Component, inject } from '@angular/core';
import { LoginLogo } from '../../components/login/login-logo/login-logo';
import { Router } from '@angular/router';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Authentication } from '../../services/authentication';
@Component({
  selector: 'app-login-page',
  standalone: true,
  imports: [LoginLogo, ReactiveFormsModule],
  templateUrl: './login-page.html',
  styleUrl: './login-page.css',
})
export class LoginPage {

  authService = inject(Authentication);
  router = inject(Router);
  private fb = inject(FormBuilder);

  isRegistering: boolean = false;
  loginError = '';

  loginForm = this.fb.group({
    correo: ['', Validators.required],
    password: ['', Validators.required],
  });

  registerForm = this.fb.group({
    nombre: ['', Validators.required],
    apellidos: ['', Validators.required],
    carne: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required],
  });

  toggleRegister() {
    this.isRegistering = true;
    this.loginError = '';
  }

  async onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    const credentials = this.loginForm.value;

    const email = credentials?.correo?.trim() ?? '';
    const password = credentials?.password?.trim() ?? '';

    try {
      const response = await fetch('http://localhost:5073/user/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        this.loginError = 'Correo o contraseña incorrectos.';
        return;
      }

      const data = await response.json();
      this.authService.setAuthenticationState(data.role ?? data.rol);
      this.loginError = '';

      await this.router.navigate(['/user']);
    } catch (error) {
      console.error('Error en la autenticación', error);
      this.loginError = 'No se pudo conectar con el servidor.';
    }
  }

  onRegister() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const payload = this.registerForm.value;
    console.log('Registrar cuenta', payload);
    // TODO: llamado a API de registro

    this.isRegistering = false;
    this.registerForm.reset();

    // for now also navigate to user page as placeholder
    this.onCancel();
  }

  onCancel() {
    this.isRegistering = false;
    this.registerForm.reset();
    this.loginError = '';
  }
}

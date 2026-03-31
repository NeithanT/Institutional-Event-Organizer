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
  registerError = '';
  registerSuccess = '';

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
    this.registerError = '';
    this.registerSuccess = '';
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
      const response = await fetch('http://localhost:5053/user/auth', {
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

  async onRegister() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      return;
    }

    const payload = this.registerForm.value;
    const idCard = Number(payload?.carne);

    if (!Number.isInteger(idCard) || idCard < 1950000000 || idCard > 2050000000) {
      this.registerError = 'El carne debe ser valido.';
      this.registerSuccess = '';
      return;
    }

    const registerPayload = {
      name: payload?.nombre?.trim() ?? '',
      lastName: payload?.apellidos?.trim() ?? '',
      idCard,
      email: payload?.correo?.trim() ?? '',
      password: payload?.password?.trim() ?? '',
    };

    try {
      const response = await fetch('http://localhost:5053/user/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(registerPayload)
      });

      if (!response.ok) {
        let errorBody: string;
        try {
          errorBody = JSON.stringify(await response.json());
        } catch {
          errorBody = await response.text();
        }
        console.error('Register failed', response.status, response.statusText, errorBody);

        if (response.status === 409) {
          this.registerError = 'Ese correo ya está registrado.';
        } else if (response.status === 400) {
          this.registerError = 'Datos de registro inválidos.';
        } else {
          this.registerError = 'No se pudo completar el registro.';
        }
        this.registerSuccess = '';
        return;
      }

      const data = await response.json();
      this.authService.setAuthenticationState(data.role ?? data.rol);
      this.registerError = '';
      this.registerSuccess = 'Cuenta creada correctamente.';

      this.registerForm.reset();
      this.onCancel();

    } catch (error) {
      console.error('Error en el registro', error);
      this.registerError = 'No se pudo conectar con el servidor.';
      this.registerSuccess = '';
    }
  }

  onCancel() {
    this.isRegistering = false;
    this.registerForm.reset();
    this.loginError = '';
    this.registerError = '';
    this.registerSuccess = '';
  }
}

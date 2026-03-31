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
  }

  onLogin() {
    if (this.loginForm.invalid) {
      this.loginForm.markAllAsTouched();
      return;
    }

    if(this.loginForm.get('usuario')?.invalid && this.loginForm.get('usuario')?.touched) {
      return;
    }

    const credentials = this.loginForm.value;

    let mail = credentials?.correo?.trim();
    let password = credentials?.password?.trim();

    fetch('http://localhost:5073/user/auth', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ mail, password })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Error en la autenticación');
      }
      return response.json();
    })
    .then(data => {
      console.log('Autenticación exitosa', data);
      // gotta verify the json at rol
      // to see if it should redirect to admin or user page

      this.authService.setAuthenticationState(data.rol);
    })
    .catch(error => {
      console.error('Error en la autenticación', error);
    });
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
  }
}

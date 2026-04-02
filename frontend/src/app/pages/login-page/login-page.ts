import { ChangeDetectorRef, Component, inject } from '@angular/core';
import { LoginLogo } from '../../components/login/login-logo/login-logo';
import { Router } from '@angular/router';
import { AbstractControl, FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Authentication } from '../../services/authentication';

const INSTITUTIONAL_EMAIL_PATTERN = /^[^\s@]+@(estudiantec\.cr|itcr\.ac\.cr)$/i;
const INSTITUTIONAL_EMAIL_MESSAGE = 'El correo debe terminar en @estudiantec.cr o @itcr.ac.cr.';
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
  private cdr = inject(ChangeDetectorRef);

  isRegistering: boolean = false;
  loginError = '';
  registerError = '';
  registerSuccess = '';

  loginForm = this.fb.group({
    correo: ['', [Validators.required, Validators.email, Validators.pattern(INSTITUTIONAL_EMAIL_PATTERN)]],
    password: ['', Validators.required],
  });

  registerForm = this.fb.group({
    nombre: ['', Validators.required],
    apellidos: ['', Validators.required],
    carne: ['', Validators.required],
    correo: ['', [Validators.required, Validators.email, Validators.pattern(INSTITUTIONAL_EMAIL_PATTERN)]],
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
      this.loginError = this.getInstitutionalEmailError(this.loginForm.get('correo')) ?? 'Complete los campos requeridos.';
      return;
    }

    const credentials = this.loginForm.value;

    const email = credentials?.correo?.trim() ?? '';
    const password = credentials?.password?.trim() ?? '';
    this.loginError = '';

    try {
      const response = await fetch('http://localhost:5053/user/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        this.loginError = response.status === 400
          ? await this.readResponseMessage(response, INSTITUTIONAL_EMAIL_MESSAGE)
          : 'Correo o contraseña incorrectos.';
        this.cdr.detectChanges();
        return;
      }

      const data = await response.json();
      this.authService.setAuthenticationState(data.role ?? data.rol);
      this.loginError = '';

      await this.router.navigate(['/user']);
    } catch (error) {
      console.error('Error en la autenticación', error);
      this.loginError = 'No se pudo conectar con el servidor.';
      this.cdr.detectChanges();
    }
  }

  async onRegister() {
    if (this.registerForm.invalid) {
      this.registerForm.markAllAsTouched();
      this.registerError = this.getInstitutionalEmailError(this.registerForm.get('correo')) ?? 'Complete los campos requeridos.';
      this.registerSuccess = '';
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
        const errorBody = await this.readResponseMessage(response, 'No se pudo completar el registro.');
        console.error('Register failed', response.status, response.statusText, errorBody);

        if (response.status === 409) {
          this.registerError = 'Ese correo ya está registrado.';
        } else if (response.status === 400) {
          this.registerError = errorBody;
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

  private getInstitutionalEmailError(control: AbstractControl | null): string | null {
    if (!control || !control.errors) {
      return null;
    }

    if (control.errors['pattern'] || control.errors['email']) {
      return INSTITUTIONAL_EMAIL_MESSAGE;
    }

    return null;
  }

  private async readResponseMessage(response: Response, fallbackMessage: string): Promise<string> {
    try {
      const body = await response.clone().json();
      if (typeof body?.message === 'string' && body.message.trim()) {
        return body.message;
      }

      if (typeof body?.Message === 'string' && body.Message.trim()) {
        return body.Message;
      }

      return fallbackMessage;
    } catch {
      try {
        const text = await response.clone().text();
        return text.trim() || fallbackMessage;
      } catch {
        return fallbackMessage;
      }
    }
  }
}

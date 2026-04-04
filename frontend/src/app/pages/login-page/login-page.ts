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
        const defaultMessage = response.status === 400
          ? INSTITUTIONAL_EMAIL_MESSAGE
          : response.status === 401
            ? 'Correo o contraseña incorrectos.'
            : 'No se pudo completar la autenticación.';

        this.loginError = await this.readResponseMessage(response, defaultMessage);
        this.cdr.detectChanges();
        return;
      }

      const data = await response.json();
      this.authService.setAuthenticationState(
        data.roleName ?? data.RoleName ?? data.role ?? data.rol
      );
      this.authService.setUserId(data.id ?? data.Id ?? 0);
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
        const errorBody = await this.readResponseMessage(
          response,
          response.status === 409 ? 'Ese correo ya está registrado.' : 'No se pudo completar el registro.'
        );

        this.registerError = errorBody;
        this.registerSuccess = '';
        this.cdr.detectChanges();
        return;
      }

      const data = await response.json();
      this.authService.setAuthenticationState(data.role ?? data.rol ?? 'user');
      this.authService.setUserId(data.id ?? data.Id ?? 0);
      this.registerError = '';
      this.registerSuccess = 'Cuenta creada correctamente.';
      this.cdr.detectChanges();

      this.registerForm.reset();
      this.onCancel();

    } catch (error) {
      console.error('Error en el registro', error);
      this.registerError = 'No se pudo conectar con el servidor.';
      this.registerSuccess = '';
      this.cdr.detectChanges();
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
      const body = await response.json();
      if (body && typeof body.message === 'string' && body.message.trim()) {
        return body.message.trim();
      }
    } catch {
    }

    return fallbackMessage;
  }
}

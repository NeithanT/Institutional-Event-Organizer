import { Component, signal, computed, ViewEncapsulation, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';
import { UserService, UpdateUserDto } from '../../services/user.service';
import { Authentication } from '../../services/authentication';

interface UserProfile {
  nombre: string;
  correo: string;
  carnet: string;
  contrasena: string;
  lenguaje: string;
  biografia: string;
  foto: string;
}

@Component({
  selector: 'app-user-profile-page',
  standalone: true,
  imports: [Navbar, Footer, FormsModule],
  templateUrl: './user-profile-page.html',
  styleUrl: './user-profile-page.css',
  encapsulation: ViewEncapsulation.None
})
export class UserProfilePage implements OnInit {

  private userService = inject(UserService);
  private auth = inject(Authentication);

  editMode = signal(false);
  saveError = signal('');
  saveSuccess = signal(false);

  user = signal<UserProfile>({
    nombre:     '',
    correo:     '',
    carnet:     '',
    contrasena: '**********',
    lenguaje:   'Español',
    biografia:  '',
    foto:       '',
  });

  editData  = signal<UserProfile>({ ...this.user() });
  previewFoto = signal<string>('');

  // Campos de contraseña separados para el modo edición
  currentPassword = signal('');
  newPassword     = signal('');

  ngOnInit() {
    const userId = this.auth.userId;
    if (userId > 0) {
      this.userService.getUser(userId).subscribe({
        next: dto => {
          const profile: UserProfile = {
            nombre:     dto.userName,
            correo:     dto.email,
            carnet:     dto.idCard ? String(dto.idCard) : '',
            contrasena: '**********',
            lenguaje:   dto.preferredLanguage ?? 'Español',
            biografia:  dto.biography ?? '',
            foto:       dto.urlImageProfile ?? '',
          };
          this.user.set(profile);
          this.previewFoto.set(profile.foto);
        }
      });
    }
  }

  // Computed: split nombre en nombre y apellidos para la cabecera
  primerNombre = computed(() => this.user().nombre.split(' ')[0] ?? '');
  apellidos    = computed(() => this.user().nombre.split(' ').slice(1).join(' '));

  startEdit() {
    this.editData.set({ ...this.user() });
    this.previewFoto.set(this.user().foto);
    this.currentPassword.set('');
    this.newPassword.set('');
    this.saveError.set('');
    this.saveSuccess.set(false);
    this.editMode.set(true);
  }

  cancelEdit() {
    this.editMode.set(false);
    this.saveError.set('');
  }

  onFotoChange(event: Event) {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files[0]) {
      const reader = new FileReader();
      reader.onload = (e) => {
        this.previewFoto.set(e.target?.result as string);
      };
      reader.readAsDataURL(input.files[0]);
    }
  }

  saveEdit() {
    const dto: UpdateUserDto = {};

    const lang = this.editData().lenguaje.trim();
    if (lang !== this.user().lenguaje) dto.preferredLanguage = lang;

    const bio = this.editData().biografia.trim();
    if (bio !== this.user().biografia) dto.biography = bio;

    const newPwd = this.newPassword().trim();
    const curPwd = this.currentPassword().trim();
    if (newPwd) {
      if (!curPwd) {
        this.saveError.set('Ingrese la contraseña actual para cambiarla.');
        return;
      }
      dto.currentPassword = curPwd;
      dto.newPassword     = newPwd;
    }

    if (Object.keys(dto).length === 0) {
      this.editMode.set(false);
      return;
    }

    const userId = this.auth.userId;
    this.userService.updateUser(userId, dto).subscribe({
      next: updated => {
        this.user.update(u => ({
          ...u,
          lenguaje:  updated.preferredLanguage ?? u.lenguaje,
          biografia: updated.biography ?? u.biografia,
        }));
        this.saveError.set('');
        this.saveSuccess.set(true);
        this.editMode.set(false);
      },
      error: err => {
        const msg = err?.error?.message ?? 'No se pudo guardar los cambios.';
        this.saveError.set(msg);
      }
    });
  }

  updateField(field: keyof UserProfile, value: string) {
    this.editData.update(d => ({ ...d, [field]: value }));
  }
}

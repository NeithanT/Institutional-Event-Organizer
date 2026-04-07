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
  private auth        = inject(Authentication);

  editMode    = signal(false);
  saveError   = signal('');
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

  editData    = signal<UserProfile>({ ...this.user() });
  previewFoto = signal<string>('');

  currentPassword = signal('');
  newPassword     = signal('');
  private pendingPhotoFile: File | null = null;

  primerNombre = computed(() => this.user().nombre.split(' ')[0] ?? '');
  apellidos    = computed(() => this.user().nombre.split(' ').slice(1).join(' '));

  ngOnInit() {
    const userId = this.auth.userId;
    if (userId <= 0) return;

    this.userService.getUser(userId).subscribe({
      next: (dto: any) => {
        const nombre    = dto.userName    ?? dto.UserName    ?? '';
        const correo    = dto.email       ?? dto.Email       ?? '';
        const idCard    = dto.idCard      ?? dto.IdCard      ?? null;
        const lang      = dto.preferredLanguage ?? dto.PreferredLanguage ?? 'Español';
        const bio       = dto.biography   ?? dto.Biography   ?? '';
        const photoUrl  = dto.urlImageProfile ?? dto.UrlImageProfile ?? null;

        const profile: UserProfile = {
          nombre,
          correo,
          carnet:     idCard != null ? String(idCard) : '',
          contrasena: '**********',
          lenguaje:   lang,
          biografia:  bio,
          foto:       this.userService.imageUrl(photoUrl),
        };
        this.user.set(profile);
        this.previewFoto.set(profile.foto);
      },
      error: err => {
        console.error('Error cargando perfil:', err);
        this.saveError.set('No se pudo cargar el perfil. Verifique que el backend esté corriendo.');
      }
    });
  }

  startEdit() {
    this.editData.set({ ...this.user() });
    this.previewFoto.set(this.user().foto);
    this.currentPassword.set('');
    this.newPassword.set('');
    this.pendingPhotoFile = null;
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
      this.pendingPhotoFile = input.files[0];
      const reader = new FileReader();
      reader.onload = (e) => this.previewFoto.set(e.target?.result as string);
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
      if (!curPwd) { this.saveError.set('Ingrese la contraseña actual para cambiarla.'); return; }
      dto.currentPassword = curPwd;
      dto.newPassword     = newPwd;
    }

    const userId = this.auth.userId;
    const hasProfileChanges = Object.keys(dto).length > 0;
    const hasPhotoChange    = this.pendingPhotoFile !== null;

    if (!hasProfileChanges && !hasPhotoChange) {
      this.editMode.set(false);
      return;
    }

    if (hasPhotoChange) {
      this.userService.uploadPhoto(userId, this.pendingPhotoFile!).subscribe({
        next: res => {
          const url = this.userService.imageUrl(res.urlImageProfile);
          this.user.update(u => ({ ...u, foto: url }));
          this.previewFoto.set(url);
          this.pendingPhotoFile = null;

          if (hasProfileChanges) {
            this.saveProfileFields(userId, dto);
          } else {
            this.saveSuccess.set(true);
            this.editMode.set(false);
          }
        },
        error: err => this.saveError.set(err?.error?.message ?? 'No se pudo subir la foto.')
      });
    } else {
      this.saveProfileFields(userId, dto);
    }
  }

  private saveProfileFields(userId: number, dto: UpdateUserDto) {
    this.userService.updateUser(userId, dto).subscribe({
      next: updated => {
        this.user.update(u => ({
          ...u,
          lenguaje:  updated.preferredLanguage ?? u.lenguaje,
          biografia: updated.biography         ?? u.biografia,
        }));
        this.saveError.set('');
        this.saveSuccess.set(true);
        this.editMode.set(false);
      },
      error: err => this.saveError.set(err?.error?.message ?? 'No se pudo guardar los cambios.')
    });
  }

  updateField(field: keyof UserProfile, value: string) {
    this.editData.update(d => ({ ...d, [field]: value }));
  }
}

import { Component, signal, ViewEncapsulation } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Navbar } from '../../components/navbar/navbar';
import { Footer } from '../../components/footer/footer';

interface UserProfile {
  nombre: string;
  apellidos: string;
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
export class UserProfilePage {

  editMode = signal(false);

  // Datos actuales del usuario 
  // — TODO: cargar desde backend GET /user/me
  user = signal<UserProfile>({
    nombre: 'Juanito',
    apellidos: 'Perez Rodriguez',
    correo: 'Juanito@estudiantec.cr',
    carnet: '2022138424',
    contrasena: '**********',
    lenguaje: 'Español',
    biografia: 'Futuro ingeniero en computación con un fuerte interés en la automatización y el desarrollo de interfaces inteligentes. Me dedico a transformar conceptos teóricos en herramientas prácticas, aprovechando mi formación académica para construir proyectos que faciliten la interacción entre el usuario y la tecnología.',
    foto: 'assets/logos/default-avatar.png'
  });

  // Copia editable para no mutar el original hasta guardar
  editData = signal<UserProfile>({ ...this.user() });

  previewFoto = signal<string>(this.user().foto);

  startEdit() {
    this.editData.set({ ...this.user() });
    this.previewFoto.set(this.user().foto);
    this.editMode.set(true);
  }

  cancelEdit() {
    this.editMode.set(false);
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
    // TODO: llamar al backend PUT /user/me con editData()
    this.user.set({
      ...this.editData(),
      foto: this.previewFoto(),
      contrasena: '**********' 
    });
    this.editMode.set(false);
  }

  updateField(field: keyof UserProfile, value: string) {
    this.editData.update(d => ({ ...d, [field]: value }));
  }
}
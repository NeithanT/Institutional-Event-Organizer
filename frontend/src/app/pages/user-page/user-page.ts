import { Component, inject } from '@angular/core';
import { Authentication } from '../../services/authentication';

@Component({
  selector: 'app-user-page',
  standalone: true,
  imports: [],
  templateUrl: './user-page.html',
  styleUrl: './user-page.css',
})
export class UserPage {
  authService = inject(Authentication);
}

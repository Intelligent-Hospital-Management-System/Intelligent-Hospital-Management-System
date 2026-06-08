import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent {
  isLoading = signal(false);

  private router = inject(Router);
  private authService = inject(AuthService);

  constructor() {
    this.authService.isLogged$.subscribe(isLogged => {
      if (isLogged) {
        this.router.navigate(['/main/items']);
      }
    });
  }

  async login(): Promise<void> {
    this.isLoading.set(true);
    try {
      await this.authService.loginWithGoogle();
    } catch (error) {
      console.error('Error durante el login:', error);
      alert('Hubo un error al iniciar sesión. Intenta nuevamente.');
    } finally {
      this.isLoading.set(false);
    }
  }
}
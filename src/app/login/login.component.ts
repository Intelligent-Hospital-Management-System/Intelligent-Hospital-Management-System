import { Component, signal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../services/auth.service';
import * as Sentry from '@sentry/angular';
import { AnalyticsService } from '../services/analytics';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent {
  isLoading = signal(false);

  private router = inject(Router);
  private authService = inject(AuthService);
  private analyticsService = inject(AnalyticsService);

  constructor() {
    this.authService.isLogged$.subscribe((isLogged) => {
      if (isLogged) {
        this.router.navigate(['/main/items']);
      }
    });
  }

  async login(): Promise<void> {
    this.isLoading.set(true);
    try {
      const user = await this.authService.loginWithGoogle();
      this.analyticsService.loginSuccess(user.email);

      Sentry.setUser({
        email: user.email,
      });
      Sentry.captureException(new Error(`Error forzado TP9 - usuario: ${user.email}`));
    } catch (error) {
      console.error('Error durante el login:', error);
      alert('Hubo un error cuando iniciar sesión. Intenta nuevamente.');
    } finally {
      this.isLoading.set(false);
    }
  }
}

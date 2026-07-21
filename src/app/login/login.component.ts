import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../services/auth.service';
import * as Sentry from '@sentry/angular';
import { AnalyticsService } from '../services/analytics';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
})
export class LoginComponent implements OnInit, OnDestroy {
  isLoading = signal(false);
  isCheckingSession = signal(true);

  private router = inject(Router);
  private authService = inject(AuthService);
  private analyticsService = inject(AnalyticsService);
  private sessionSub?: Subscription;

  ngOnInit(): void {
    this.sessionSub = this.authService.isLogged$.subscribe({
      next: (isLogged) => {
        if (isLogged) {
          this.router.navigate(['/main/items']);
        } else {
          this.isCheckingSession.set(false);
        }
      },
      error: (err) => {
        console.error('Error checking session state:', err);
        this.isCheckingSession.set(false);
      },
    });
  }

  ngOnDestroy(): void {
    if (this.sessionSub) {
      this.sessionSub.unsubscribe();
    }
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

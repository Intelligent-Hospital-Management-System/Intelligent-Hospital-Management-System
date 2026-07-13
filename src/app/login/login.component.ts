import { Component, signal, inject, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService } from '../services/auth.service';
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
      await this.authService.loginWithGoogle();
    } catch (error) {
      console.error('Error durante el login:', error);
      alert('Hubo un error al iniciar sesión. Intenta nuevamente.');
    } finally {
      this.isLoading.set(false);
    }
  }
}

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService, AuthUser } from '../services/auth.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css'],
})
export class ConfigComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  user: { name: string; email: string; profilePic: string; role: string } = {
    name: '',
    email: '',
    profilePic: '',
    role: 'Administrador',
  };

  // App Info
  appInfo = {
    name: 'Intelligent Hospital Management System (IHMS)',
    version: '1.0.0',
    userAgent: '',
  };

  ngOnInit() {
    this.appInfo.userAgent = navigator.userAgent;

    this.authService.user$.subscribe((userData: AuthUser | null) => {
      if (userData) {
        this.user.name = userData.name;
        this.user.email = userData.email;
        this.user.profilePic = userData.photoUrl || 'https://i.pravatar.cc/150';
        this.cdr.detectChanges();
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  async logout() {
    const confirmLogout = window.confirm('¿Estás seguro de que deseas cerrar sesión?');
    if (confirmLogout) {
      await this.authService.logout();
      this.router.navigate(['/login']);
    }
  }
}

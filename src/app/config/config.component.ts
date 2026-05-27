import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../services/auth.service';
import { User } from '@angular/fire/auth';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css']
})
export class ConfigComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);

  user: { name: string; email: string; profilePic: string; role: string } = {
    name: '',
    email: '',
    profilePic: '',
    role: 'Administrador'
  };

  // App Info
  appInfo = {
    name: 'Intelligent Hospital Management System (IHMS)',
    version: '1.0.0',
    userAgent: ''
  };

  ngOnInit() {
    this.appInfo.userAgent = navigator.userAgent;

    this.authService.user$.subscribe((firebaseUser: User | null) => {
      if (firebaseUser) {
        this.user.name = firebaseUser.displayName || 'Usuario';
        this.user.email = firebaseUser.email || '';
        this.user.profilePic = firebaseUser.photoURL || 'https://i.pravatar.cc/150';
        this.cdr.detectChanges();
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

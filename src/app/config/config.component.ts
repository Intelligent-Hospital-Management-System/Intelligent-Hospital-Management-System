import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, AuthUser } from '../services/auth.service';
import { ChangeDetectorRef } from '@angular/core';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [CommonModule, FormsModule],
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

  userProfile: { phone: string; address: string; birthdate: string } = {
    phone: '',
    address: '',
    birthdate: ''
  };

  isEditing = false;
  maxDate: string = '';
  minDate: string = '';

  // App Info
  appInfo = {
    name: 'Intelligent Hospital Management System (IHMS)',
    version: '1.0.0',
    userAgent: ''
  };

  get formattedBirthdate(): string {
    if (!this.userProfile.birthdate) return '';
    const [year, month, day] = this.userProfile.birthdate.split('-');
    return `${day}/${month}/${year}`;
  }

  ngOnInit() {
    this.appInfo.userAgent = navigator.userAgent;

    const today = new Date();
    const maxYear = today.getFullYear() - 16;
    const minYear = today.getFullYear() - 100;
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    
    this.maxDate = `${maxYear}-${month}-${day}`;
    this.minDate = `${minYear}-${month}-${day}`;

    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      this.userProfile = JSON.parse(savedProfile);
    }

    this.authService.user$.subscribe((userData: AuthUser | null) => {
      if (userData) {
        this.user.name = userData.name;
        this.user.email = userData.email;
        this.user.profilePic = userData.photoUrl || 'https://i.pravatar.cc/150';
        this.cdr.detectChanges();
      }
      else {
        this.router.navigate(['/login'])
      }
    });
  }

  editProfile() {
    this.isEditing = true;
  }

  cancelEdit() {
    this.isEditing = false;
    const savedProfile = localStorage.getItem('userProfile');
    if (savedProfile) {
      this.userProfile = JSON.parse(savedProfile);
    }
  }

  saveProfile() {
    localStorage.setItem('userProfile', JSON.stringify(this.userProfile));
    this.isEditing = false;
  }

  async logout() {
    const confirmLogout = window.confirm('¿Estás seguro de que deseas cerrar sesión?');
    if (confirmLogout) {
      await this.authService.logout();
    }
  }
}

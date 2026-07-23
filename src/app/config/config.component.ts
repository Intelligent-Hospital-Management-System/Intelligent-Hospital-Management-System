import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthService, AuthUser } from '../services/auth.service';
import { ChangeDetectorRef } from '@angular/core';
import { AnalyticsService } from '../services/analytics';
import { RouterLink } from '@angular/router';
import { ProfileStateService, UserProfile } from '../services/profile-state.service';

@Component({
  selector: 'app-config',
  standalone: true,
  imports: [CommonModule, FormsModule, TranslateModule, RouterLink],
  templateUrl: './config.component.html',
  styleUrls: ['./config.component.css'],
})
export class ConfigComponent implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private cdr = inject(ChangeDetectorRef);
  private analyticsService = inject(AnalyticsService);
  private profileService = inject(ProfileStateService);

  user: { name: string; email: string; profilePic: string; role: string } = {
    name: '',
    email: '',
    profilePic: '',
    role: 'Administrador',
  };

  userProfile: UserProfile = {
    phone: '',
    address: '',
    birthdate: '',
  };

  isEditing = false;
  maxDate: string = '';
  minDate: string = '';

  // App Info
  appInfo = {
    name: 'Intelligent Hospital Management System (IHMS)',
    version: '1.0.0',
    userAgent: '',
  };

  get formattedBirthdate(): string {
    if (!this.userProfile.birthdate) return '';
    const [year, month, day] = this.userProfile.birthdate.split('-');
    return `${day}/${month}/${year}`;
  }

  ngOnInit() {
    this.analyticsService.dashboardViewed();
    this.appInfo.userAgent = navigator.userAgent;

    const today = new Date();
    const maxYear = today.getFullYear() - 16;
    const minYear = today.getFullYear() - 100;
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    this.maxDate = `${maxYear}-${month}-${day}`;
    this.minDate = `${minYear}-${month}-${day}`;
    const savedProfile = this.profileService.getProfile();
    if (savedProfile) {
      this.userProfile = savedProfile;
    }

    this.authService.user$.subscribe((userData: AuthUser | null) => {
      if (userData) {
        this.user.name = userData.name;
        this.user.email = userData.email;
        this.user.profilePic = userData.photoUrl;
        this.cdr.detectChanges();
      } else {
        this.router.navigate(['/login']);
      }
    });
  }

  editProfile() {
    this.isEditing = true;
  }

  async logout() {
    const confirmLogout = window.confirm('¿Estás seguro de que deseas cerrar sesión?');
    if (confirmLogout) {
      await this.authService.logout();
    }
  }
}

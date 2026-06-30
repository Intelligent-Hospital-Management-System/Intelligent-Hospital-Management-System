import { CommonModule } from '@angular/common';
import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService, AuthUser } from '../services/auth.service';
import { ProfileStorageService, UserProfile } from '../services/profile-storage.service';

@Component({
  selector: 'app-account',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.css', '../config/config.component.css'],
})
export class Account implements OnInit {
  private router = inject(Router);
  private authService = inject(AuthService);
  private profileStorageService = inject(ProfileStorageService);

  user: { name: string; email: string; profilePic: string } = {
    name: '',
    email: '',
    profilePic: '',
  };

  userProfile: UserProfile = {
    phone: '',
    address: '',
    birthdate: '',
  };

  maxDate: string = '';
  minDate: string = '';

  ngOnInit() {
    const today = new Date();
    const year = today.getFullYear();
    const minYear = today.getFullYear() - 100;
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');

    this.maxDate = `${year}-${month}-${day}`;
    this.minDate = `${minYear}-${month}-${day}`;

    const savedProfile = this.profileStorageService.getUserProfile();

    if (savedProfile) {
      this.userProfile = savedProfile;
    }

    this.authService.user$.subscribe((userData: AuthUser | null) => {
      if (userData) {
        this.user.name = userData.name;
        this.user.email = userData.email;
        this.user.profilePic = userData.photoUrl;
      }
    });
  }

  onPhoneInput(event: Event) {
    const input = event.target as HTMLInputElement;

    let value = input.value.replace(/[^0-9]/g, '');
    if (value.length > 15) {
      value = value.substring(0, 15);
    }
    this.userProfile.phone = value;
    input.value = value;
  }

  saveProfile() {
    this.userProfile.phone = this.userProfile.phone.trim();
    this.userProfile.address = this.userProfile.address.trim();

    if (!this.userProfile.phone || !this.userProfile.address || !this.userProfile.birthdate) {
      return;
    }

    this.profileStorageService.saveUserProfile(this.userProfile);
    this.router.navigate(['/main/config']);
  }

  cancelEdit() {
    this.router.navigate(['/main/config']);
  }
}

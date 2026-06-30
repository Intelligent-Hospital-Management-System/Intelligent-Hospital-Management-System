import { Injectable } from '@angular/core';

export interface UserProfile {
  phone: string;
  address: string;
  birthdate: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProfileStorageService {
  private readonly PROFILE_KEY = 'userProfile';

  getUserProfile(): UserProfile | null {
    const savedProfile = localStorage.getItem(this.PROFILE_KEY);
    if (savedProfile) {
      try {
        return JSON.parse(savedProfile);
      } catch (error) {
        console.error('Error parsing user profile from local storage', error);
        return null;
      }
    }
    return null;
  }

  saveUserProfile(profile: UserProfile): void {
    localStorage.setItem(this.PROFILE_KEY, JSON.stringify(profile));
  }
}

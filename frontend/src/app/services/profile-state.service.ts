import { Injectable } from '@angular/core';
import { StorageService } from './storage.service';

export interface UserProfile {
  phone: string;
  address: string;
  birthdate: string;
}

const PROFILE_KEY = 'userProfile';

@Injectable({
  providedIn: 'root',
})
export class ProfileStateService {
  constructor(private storageService: StorageService) {}

  getProfile(): UserProfile | null {
    const profile = this.storageService.get<UserProfile>(PROFILE_KEY);
    if (profile) {
      console.log('[Profile] Loaded from storage:', profile);
    } else {
      console.log('[Profile] No profile found in storage.');
    }
    return profile;
  }

  saveProfile(profile: UserProfile): void {
    this.storageService.set<UserProfile>(PROFILE_KEY, profile);
    console.log('[Profile] Saved to storage:', profile);
  }

  clearProfile(): void {
    this.storageService.remove(PROFILE_KEY);
    console.log('[Profile] Cleared from storage.');
  }
}

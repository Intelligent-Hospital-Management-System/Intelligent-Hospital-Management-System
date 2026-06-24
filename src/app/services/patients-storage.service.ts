import { Injectable } from '@angular/core';

export interface Patient {
  name: {
    first: string;
    last: string;
  };
  email: string;
  phone: string;
  picture: {
    thumbnail: string;
  };
}

interface PatientsCacheData {
  timestamp: number;
  data: Patient[];
}

@Injectable({
  providedIn: 'root',
})
export class PatientsStorageService {
  private cacheKey = 'patientsCache';
  private cacheDurationMs = 5 * 60 * 1000;

  getPatients(): Patient[] | null {
    const cachedString = localStorage.getItem(this.cacheKey);

    if (!cachedString) {
      return null;
    }

    try {
      const cacheData: PatientsCacheData = JSON.parse(cachedString);

      if (Date.now() - cacheData.timestamp < this.cacheDurationMs) {
        return cacheData.data;
      }

      localStorage.removeItem(this.cacheKey);
      return null;
    } catch {
      localStorage.removeItem(this.cacheKey);
      return null;
    }
  }

  savePatients(patients: Patient[]): void {
    const cacheData: PatientsCacheData = {
      timestamp: Date.now(),
      data: patients,
    };

    localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
  }
}

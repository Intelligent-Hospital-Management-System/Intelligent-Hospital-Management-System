import { Injectable, signal } from '@angular/core';

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

@Injectable({
  providedIn: 'root',
})
export class PatientsService {
  private cacheKey = 'patientsCache';
  patients = signal<Patient[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');

  loadPatients(): void {
    const cachedPatients = localStorage.getItem(this.cacheKey);

    if (cachedPatients) {
      this.patients.set(JSON.parse(cachedPatients));
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    fetch('https://randomuser.me/api/?results=20')
      .then((response) => response.json())
      .then((data) => {
        this.patients.set(data.results);
        localStorage.setItem(this.cacheKey, JSON.stringify(data.results));
        this.isLoading.set(false);
      })
      .catch(() => {
        this.errorMessage.set('No se pudieron cargar los pacientes.');
        this.isLoading.set(false);
      });
  }
}

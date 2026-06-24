import { Injectable, signal } from '@angular/core';
import { PatientsService } from './patients.service';
import { PatientsStorageService, Patient } from './patients-storage.service';

@Injectable({
  providedIn: 'root',
})
export class PatientsStateService {
  patients = signal<Patient[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(
    private patientsService: PatientsService,
    private storageService: PatientsStorageService,
  ) {}

  async loadPatients(): Promise<void> {
    const cachedPatients = this.storageService.getPatients();

    if (cachedPatients) {
      this.patients.set(cachedPatients);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const patients = await this.patientsService.getPatients();

      this.patients.set(patients);
      this.storageService.savePatients(patients);
    } catch {
      this.errorMessage.set('No se pudieron cargar los pacientes.');
    } finally {
      this.isLoading.set(false);
    }
  }
}

import { Injectable, signal } from '@angular/core';
import { PatientsService, Patient } from './patients.service';
import { ItemStorageService } from './item-storage.service';
import { firstValueFrom } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class PatientsStateService {
  patients = signal<Patient[]>([]);
  isLoading = signal(false);
  errorMessage = signal('');

  constructor(
    private patientsService: PatientsService,
    private storageService: ItemStorageService,
  ) {}

  async loadPatients(): Promise<void> {
    const cachedPatients = this.storageService.getData<Patient>('patientsCache');

    if (cachedPatients) {
      this.patients.set(cachedPatients);
      return;
    }

    this.isLoading.set(true);
    this.errorMessage.set('');

    try {
      const patients = await firstValueFrom(this.patientsService.getPatients());

      this.patients.set(patients);
      this.storageService.saveData<Patient>('patientsCache', patients);
    } catch {
      this.errorMessage.set('No se pudieron cargar los pacientes.');
    } finally {
      this.isLoading.set(false);
    }
  }
}

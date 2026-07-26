import { Component, signal, computed, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { PatientsStateService } from '../services/patients-state.service';
import { PatientsService } from '../services/patients.service';

@Component({
  selector: 'app-patients',
  imports: [CommonModule, FormsModule],
  templateUrl: './patients.html',
  styleUrl: './patients.css',
})
export class Patients {
  private patientsStateService = inject(PatientsStateService);
  searchText = signal('');

  patients = this.patientsStateService.patients;
  isLoading = this.patientsStateService.isLoading;
  errorMessage = this.patientsStateService.errorMessage;

  constructor() {
    this.patientsStateService.loadPatients();
  }
  filteredPatients = computed(() => {
    const search = this.searchText().toLowerCase();

    if (!search) {
      return this.patients();
    }

    return this.patients().filter((patient) =>
      `${patient.name.first} ${patient.name.last}`.toLowerCase().includes(search),
    );
  });
  onSearchChange(value: string): void {
    this.searchText.set(value);
  }
}

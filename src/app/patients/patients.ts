import { Component, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

interface Patient {
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

@Component({
  selector: 'app-patients',
  imports: [CommonModule, FormsModule],
  templateUrl: './patients.html',
  styleUrl: './patients.css',
})
export class Patients {
  patients = signal<Patient[]>([]);
  searchText = signal('');
  isLoading = signal(false);
  errorMessage = signal('');
  filteredPatients = computed(() => {
    const search = this.searchText().toLowerCase();

    if (!search) {
      return this.patients();
    }

    return this.patients().filter((patient) =>
      `${patient.name.first} ${patient.name.last}`.toLowerCase().includes(search),
    );
  });
  constructor() {
    this.loadPatients();
  }

  loadPatients(): void {
    this.isLoading.set(true);
    this.errorMessage.set('');

    fetch('https://randomuser.me/api/?results=20')
      .then((response) => response.json())
      .then((data) => {
        this.patients.set(data.results);
        this.isLoading.set(false);
      })
      .catch(() => {
        this.errorMessage.set('No se pudieron cargar los pacientes.');
        this.isLoading.set(false);
      });
  }

  onSearchChange(value: string): void {
    this.searchText.set(value);
  }
}

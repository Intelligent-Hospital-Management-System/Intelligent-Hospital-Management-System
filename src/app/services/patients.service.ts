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
  async getPatients(): Promise<Patient[]> {
    const response = await fetch('https://randomuser.me/api/?results=20');
    const data = await response.json();

    return data.results;
  }
}

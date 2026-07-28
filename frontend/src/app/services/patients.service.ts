import { Injectable } from '@angular/core';
import { from, Observable } from 'rxjs';

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
  getPatients(): Observable<Patient[]> {
    return from(
      fetch('https://randomuser.me/api/?results=20')
        .then((response) => response.json())
        .then((data) => data.results),
    );
  }
}

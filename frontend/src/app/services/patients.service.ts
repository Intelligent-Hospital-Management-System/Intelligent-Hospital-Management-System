import { Injectable } from '@angular/core';
import { getAuth } from 'firebase/auth';
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
  private auth = getAuth();
  getPatients(): Observable<Patient[]> {
    const currentUser = this.auth.currentUser;
    if (!currentUser) {
      throw new Error('Usuario no autenticado');
    }
    return from(
      currentUser.getIdToken().then((token) =>
        fetch('https://ihms-backend-plzd.onrender.com/patients', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }).then(async (response) => {
          const data = await response.json();

          if (!response.ok) {
            throw new Error(data.message || 'error al consultar pacientes');
          }
          return data;
        }),
      ),
    );
  }
}

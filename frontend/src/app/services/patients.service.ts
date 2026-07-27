import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, throwError } from 'rxjs';

export interface Patient {
  id?: string;
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

const FIRESTORE_PATIENTS_URL =
  'https://firestore.googleapis.com/v1/projects/ihms-d5f57/databases/(default)/documents/patients?pageSize=100';

@Injectable({
  providedIn: 'root',
})
export class PatientsService {
  private backendUrl = 'http://localhost:3000/patients';

  constructor(private http: HttpClient) {}

  getPatients(): Observable<Patient[]> {
    return this.http.get<Patient[]>(this.backendUrl).pipe(
      catchError((err) => {
        console.warn(
          '[PatientsService] Backend local no responde. Conectando directamente a Firestore...',
          err,
        );
        return this.getPatientsFromFirestoreDirect();
      }),
    );
  }

  private getPatientsFromFirestoreDirect(): Observable<Patient[]> {
    return this.http.get<any>(FIRESTORE_PATIENTS_URL).pipe(
      map((response) => {
        const documents = response.documents || [];
        return documents.map((doc: any) => {
          const fields = doc.fields || {};
          const id = doc.name ? doc.name.split('/').pop() : undefined;
          return {
            id,
            name: {
              first: fields.name?.mapValue?.fields?.first?.stringValue || 'Sin nombre',
              last: fields.name?.mapValue?.fields?.last?.stringValue || '',
            },
            email: fields.email?.stringValue || '',
            phone: fields.phone?.stringValue || '',
            picture: {
              thumbnail: fields.picture?.mapValue?.fields?.thumbnail?.stringValue || '',
            },
          } as Patient;
        });
      }),
      catchError((err) => {
        console.error('[PatientsService] Error al obtener pacientes desde la base de datos:', err);
        return throwError(
          () => new Error('Error al obtener la lista de pacientes de la base de datos'),
        );
      }),
    );
  }
}

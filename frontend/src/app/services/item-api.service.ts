import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Item } from '../models/item.model';

const FIRESTORE_ITEMS_URL =
  'https://firestore.googleapis.com/v1/projects/ihms-d5f57/databases/(default)/documents/items?pageSize=300';

@Injectable({
  providedIn: 'root',
})
export class ItemApiService {
  private localBackendUrl = 'http://localhost:3000/items';
  private renderBackendUrl = 'https://ihms-backend-plzd.onrender.com/items';
  private geoapifyApiKey = '3a2b7c2f9c534dd4be9d011e324d08c5';

  constructor(private http: HttpClient) {}

  getItems(): Observable<Item[]> {
    return this.http.get<Item[]>(this.localBackendUrl).pipe(
      catchError(() => {
        console.warn('[ItemApiService] Backend local no disponible, intentando backend remoto...');
        return this.http.get<Item[]>(this.renderBackendUrl);
      }),
      catchError(() => {
        console.warn(
          '[ItemApiService] Backend remoto no disponible, consultando Firestore directo...',
        );
        return this.getItemsFromFirestoreDirect();
      }),
      catchError((error) => {
        console.error('[ItemApiService] Error al obtener establecimientos:', error);
        return throwError(() => new Error('Error al obtener establecimientos de la base de datos'));
      }),
    );
  }

  private getItemsFromFirestoreDirect(): Observable<Item[]> {
    return this.http.get<any>(FIRESTORE_ITEMS_URL).pipe(
      map((response) => {
        const documents = response.documents || [];
        return documents.map((doc: any) => {
          const fields = doc.fields || {};
          const id = doc.name ? doc.name.split('/').pop() : undefined;
          return {
            id,
            name: fields.name?.stringValue || 'Sin nombre',
            city: fields.city?.stringValue || '',
            address: fields.address?.stringValue || '',
            type: fields.type?.stringValue || 'Hospital',
            latitude: fields.latitude?.doubleValue ?? fields.latitude?.integerValue ?? null,
            longitude: fields.longitude?.doubleValue ?? fields.longitude?.integerValue ?? null,
            active: fields.active?.booleanValue ?? true,
          } as Item;
        });
      }),
    );
  }

  reverseGeocode(lat: number, lon: number): Observable<{ city: string; address: string }> {
    const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${this.geoapifyApiKey}`;

    return this.http.get<any>(url).pipe(
      map((response) => {
        const props = response?.features?.[0]?.properties || {};
        const city =
          props.city || props.town || props.village || props.municipality || props.county || '';
        const street = props.street || '';
        const housenumber = props.housenumber || '';
        const address = housenumber ? `${street} ${housenumber}`.trim() : street;

        return { city, address };
      }),
      catchError((error) => {
        console.error('Geoapify error:', error);
        return throwError(() => new Error('Error al obtener la dirección'));
      }),
    );
  }
}

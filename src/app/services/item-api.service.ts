import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Item } from '../models/item.model';

@Injectable({
  providedIn: 'root',
})
export class ItemApiService {
  private backendUrl = 'https://ihms-backend-plzd.onrender.com/items';
  private geoapifyApiKey = '3a2b7c2f9c534dd4be9d011e324d08c5';

  constructor(private http: HttpClient) {}

  getItems(): Observable<Item[]> {
    return this.http.get<Item[]>(this.backendUrl).pipe(
      catchError((error) => {
        console.error('Backend API Error:', error);
        return throwError(() => new Error('Error al obtener establecimientos'));
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

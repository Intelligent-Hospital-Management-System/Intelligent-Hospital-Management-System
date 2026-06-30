import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { Item } from '../models/item.model';

@Injectable({
  providedIn: 'root',
})
export class ItemApiService {
  private apiUrl = 'https://healthsites.io/api/v3/facilities/';
  private proxyUrl = 'https://api.codetabs.com/v1/proxy?quest=';
  private apiKey = '3cf67919f59931bd81146de940ffb6c418d238b3';
  private geoapifyApiKey = '3a2b7c2f9c534dd4be9d011e324d08c5';

  constructor(private http: HttpClient) {}

  getItems(): Observable<Item[]> {
    const targetUrl = `${this.apiUrl}?country=Argentina&api-key=${this.apiKey}&limit=5000`;
    const finalUrl = `${this.proxyUrl}${encodeURIComponent(targetUrl)}`;

    return this.http.get<any>(finalUrl).pipe(
      map((response) => {
        let facilities = response;

        if (!Array.isArray(response)) {
          facilities = response.features || [];
        }

        if (!Array.isArray(facilities)) {
          return [];
        }

        return facilities
          .map((facility: any, index: number) => {
            const props = facility.attributes || facility.properties || {};
            const coords = facility.centroid?.coordinates || facility.geometry?.coordinates;

            let name = props.name;
            const lowerName = (name || '').toLowerCase();

            let isHospital = props.healthcare === 'hospital' || props.amenity === 'hospital';

            let isClinic = props.healthcare === 'clinic' || props.amenity === 'clinic';

            if (
              lowerName.includes('clínica') ||
              lowerName.includes('clinica') ||
              lowerName.includes('centro médico')
            ) {
              isClinic = true;
              isHospital = false;
            } else if (lowerName.includes('hospital')) {
              isHospital = true;
              isClinic = false;
            }

            if (!isHospital && !isClinic) {
              return null;
            }

            const type = isHospital ? 'Hospital' : 'Clínica';

            if (!name) {
              name = `${type} ${index + 1}`;
            }

            const city = props['addr_city'] || props['addr:city'] || '';

            const address =
              props['addr_full'] || props['addr:street'] || props['addr_street'] || '';

            return {
              id: props.uuid || index,
              name,
              city,
              address,
              type,
              latitude: coords ? coords[1] : null,
              longitude: coords ? coords[0] : null,
            };
          })
          .filter((item) => item !== null) as Item[];
      }),
      catchError((error) => {
        console.error('API Error:', error);

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

import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, map, tap } from 'rxjs/operators';

export interface Item {
  id: string | number;
  name: string;
  city: string;
  address: string;
  type: string;
  latitude: number | null;
  longitude: number | null;
  [key: string]: any;
}

interface CacheData {
  timestamp: number;
  data: Item[];
}

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private apiUrl = 'https://healthsites.io/api/v3/facilities/';
  private proxyUrl = 'https://api.codetabs.com/v1/proxy?quest=';
  private cacheKey = 'healthsitesCacheV3';
  private cacheDurationMs = 5 * 60 * 1000;
  private apiKey = '3cf67919f59931bd81146de940ffb6c418d238b3';

  constructor(private http: HttpClient) { }

  getItems(): Observable<Item[]> {
    const cachedString = localStorage.getItem(this.cacheKey);
    if (cachedString) {
      try {
        const cacheData: CacheData = JSON.parse(cachedString);
        const now = new Date().getTime();

        if (now - cacheData.timestamp < this.cacheDurationMs) {
          console.log('Returning data from cache');
          return of(cacheData.data);
        } else {
          console.log('Cache expired, fetching new data');
          localStorage.removeItem(this.cacheKey);
        }
      } catch (e) {
        console.error('Error parsing cache', e);
        localStorage.removeItem(this.cacheKey);
      }
    }

    const targetUrl = `${this.apiUrl}?country=Argentina&api-key=${this.apiKey}&limit=5000`;
    const finalUrl = `${this.proxyUrl}${encodeURIComponent(targetUrl)}`;

    return this.http.get<any>(finalUrl).pipe(
      map(response => {
        let facilities = response;
        if (!Array.isArray(response)) {
          facilities = response.features || [];
        }

        if (!Array.isArray(facilities)) {
          return [];
        }

        return facilities.map((facility: any, index: number) => {
          const props = facility.attributes || facility.properties || {};
          const coords = facility.centroid?.coordinates || facility.geometry?.coordinates;

          let name = props.name;
          const lowerName = (name || '').toLowerCase();

          let isHospital = props.healthcare === 'hospital' || props.amenity === 'hospital';
          let isClinic = props.healthcare === 'clinic' || props.amenity === 'clinic';

          if (lowerName.includes('clínica') || lowerName.includes('clinica') || lowerName.includes('centro médico')) {
            isClinic = true;
            isHospital = false;
          } else if (lowerName.includes('hospital')) {
            isHospital = true;
            isClinic = false;
          }

          if (!isHospital && !isClinic) return null;

          const type = isHospital ? 'Hospital' : 'Clínica';

          if (!name) {
            name = `${type} ${index + 1}`;
          }

          const city = props['addr_city'] || props['addr:city'] || 'Ciudad no especificada';
          const address = props['addr_full'] || props['addr:street'] || props['addr_street'] || 'Dirección no especificada';

          return {
            id: props.uuid || index,
            name: name,
            city: city,
            address: address,
            type: type,
            latitude: coords ? coords[1] : null,
            longitude: coords ? coords[0] : null
          };
        }).filter((item: any) => item !== null) as Item[];
      }),
      tap(data => {
        const cacheData: CacheData = {
          timestamp: new Date().getTime(),
          data: data
        };
        localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
      }),
      catchError(error => {
        console.error('API Error:', error);

        if (error.status === 401 || error.status === 403) {
          const detail = error.error?.detail || 'Se requiere una API Key de Healthsites válida y activa.';
          return throwError(() => new Error(`Error de Healthsites: ${detail}`));
        }

        return throwError(() => new Error('Error al obtener los establecimientos de Healthsites. Por favor intente más tarde.'));
      })
    );
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, throwError } from 'rxjs';
import { catchError, finalize, map, shareReplay, tap } from 'rxjs/operators';

export interface Item {
  id: string | number;
  name: string;
  city: string;
  address: string;
  type: string;
  latitude: number | null;
  longitude: number | null;
  isGeocoding?: boolean;
  [key: string]: any;
}

interface CacheData {
  timestamp: number;
  data: Item[];
}

interface GeocodeCacheEntry {
  city: string;
  address: string;
  timestamp: number;
}

interface GeocodeCache {
  [key: string]: GeocodeCacheEntry;
}

@Injectable({
  providedIn: 'root'
})
export class ItemService {
  private apiUrl = 'https://healthsites.io/api/v3/facilities/';
  private proxyUrl = 'https://corsproxy.io/?url=';
  private cacheKey = 'healthsitesCacheV3';
  private cacheDurationMs = 5 * 60 * 1000;
  private apiKey = '3cf67919f59931bd81146de940ffb6c418d238b3';

  private geoapifyApiKey = '3a2b7c2f9c534dd4be9d011e324d08c5';
  private geocodeCacheKey = 'geoapifyReverseGeocode';
  private geocodeCacheDurationMs = 30 * 24 * 60 * 60 * 1000; // 30 días
  private itemsRequest$: Observable<Item[]> | null = null;

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
    if (this.itemsRequest$) {
        console.log('Request already in progress');
          return this.itemsRequest$;
    }

    const targetUrl = `${this.apiUrl}?country=Argentina&api-key=${this.apiKey}&limit=1000`;
    const finalUrl = `${this.proxyUrl}${targetUrl}`;

    this.itemsRequest$ = this.http.get<any>(finalUrl).pipe(
      map(response => {
        let facilities = response;
        if (!Array.isArray(response)) {
          facilities = response.features || [];
        }
        if (!Array.isArray(facilities)) return [];

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
          if (!name) name = `${type} ${index + 1}`;

          const city = props['addr_city'] || props['addr:city'] || '';
          const address = props['addr_full'] || props['addr:street'] || props['addr_street'] || '';

          return {
            id: props.uuid || index,
            name,
            city,
            address,
            type,
            latitude: coords ? coords[1] : null,
            longitude: coords ? coords[0] : null
          };
        }).filter((item: any) => item !== null) as Item[];
      }),
      tap(data => {
        const cacheData: CacheData = { timestamp: new Date().getTime(), data };
        localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
      }),
      shareReplay(1),
      finalize(() => {
        this.itemsRequest$ = null;
      }),
      catchError(error => {
        console.error('API Error:', error);
        this.itemsRequest$ = null; 
        if (error.status === 401 || error.status === 403) {
          const detail = error.error?.detail || 'Se requiere una API Key de Healthsites válida y activa.';
          return throwError(() => new Error(`Error de Healthsites: ${detail}`));
        }
        return throwError(() => new Error('Error al obtener los establecimientos de Healthsites. Por favor intente más tarde.'));
      })
    );
 
    return this.itemsRequest$;
  
  }

  needsGeocode(item: Item): boolean {
    return (!item.city || !item.address) &&
      item.latitude !== null &&
      item.longitude !== null;
  }

  reverseGeocode(lat: number, lon: number): Observable<{ city: string; address: string }> {
    const coordKey = `${lat.toFixed(4)},${lon.toFixed(4)}`;

    // Verificar cache local primero
    try {
      const cacheString = localStorage.getItem(this.geocodeCacheKey);
      if (cacheString) {
        const cache: GeocodeCache = JSON.parse(cacheString);
        const entry = cache[coordKey];
        if (entry && (Date.now() - entry.timestamp) < this.geocodeCacheDurationMs) {
          return of({ city: entry.city, address: entry.address });
        }
      }
    } catch (e) {
      console.error('Error reading geocode cache', e);
    }

    const url = `https://api.geoapify.com/v1/geocode/reverse?lat=${lat}&lon=${lon}&apiKey=${this.geoapifyApiKey}`;

    return this.http.get<any>(url).pipe(
      map(response => {
        const props = response?.features?.[0]?.properties || {};
        const city = props.city || props.town || props.village || props.municipality || props.county || '';
        const street = props.street || '';
        const housenumber = props.housenumber || '';
        const address = housenumber ? `${street} ${housenumber}`.trim() : street;
        return { city, address };
      }),
      tap(result => {
        try {
          const cacheString = localStorage.getItem(this.geocodeCacheKey);
          const cache: GeocodeCache = cacheString ? JSON.parse(cacheString) : {};
          cache[coordKey] = { ...result, timestamp: Date.now() };
          localStorage.setItem(this.geocodeCacheKey, JSON.stringify(cache));
        } catch (e) {
          console.error('Error saving geocode cache', e);
        }
      }),
      catchError(error => {
        console.error('Geoapify error:', error);
        return of({ city: '', address: '' });
      })
    );
  }
}
